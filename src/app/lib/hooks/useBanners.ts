"use client";
import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessageOnUi } from "@/lib/errors/getApiErrorMessageOnUi";
export interface BannerStore {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  desktopImage: string;
  mobileImage: string;
  store: BannerStore | null;
  affiliateUrl: string;
  country: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BannerFilters {
  search: string;
  store: string;
  isActive: string;
  country: string;
}

interface BannerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UseBannersOptions {
  initialLimit?: number;
  initialIsActive?: string;
}

interface UseBannersReturn {
  banners: Banner[];
  pagination: BannerPagination;
  filters: BannerFilters;
  loading: boolean;
  error: string | null;
  setSearch: (value: string) => void;
  setStore: (value: string) => void;
  setIsActive: (value: string) => void;
  setCountry: (value: string) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  refresh: () => Promise<void>;
  createBanner: ( data: Record<string, unknown> ) => Promise<Banner>;
  updateBanner: ( id: string, data: Record<string, unknown> ) => Promise<Banner>;
  deleteBanner: (id: string) => Promise<void>;
  clearFilters: () => void;
}

const DEFAULT_FILTERS: BannerFilters = {
  search: "",
  store: "",
  isActive: "",
  country: "",
};

export function useBanners( options: UseBannersOptions = {}): UseBannersReturn {
  const { initialLimit = 10, initialIsActive = "", } = options;
  const [banners, setBanners] = useState<Banner[]>([]);
  const [pagination, setPagination] = useState<BannerPagination>({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [filters, setFilters] = useState<BannerFilters>(() => ({
    ...DEFAULT_FILTERS,
    isActive: initialIsActive,
  }));

  const [debouncedSearch, setDebouncedSearch] = useState(
    DEFAULT_FILTERS.search
  );

  // Debounce search to avoid excessive API requests.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [filters.search]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /*
   * Build API query parameters.
   */
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", pagination.page.toString());
    params.set("limit", pagination.limit.toString());
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }

    if (filters.store) {
      params.set("store", filters.store);
    }

    if (filters.isActive) {
      params.set("isActive", filters.isActive);
    }

    if (filters.country.trim()) {
      params.set("country", filters.country.trim());
    }

    return params.toString();
  }, [
    pagination.page,
    pagination.limit,
    debouncedSearch,
    filters.store,
    filters.isActive,
    filters.country,
  ]);

  /*
   * Fetch banners.
   */
  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const requestedPage = pagination.page;
      const queryString = buildQueryString();
      const response = await fetch(
        `/api/admin/banners?${queryString}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(
          getApiErrorMessageOnUi(
            data,
            "Failed to fetch banners."
          )
        );
      }

      const nextPagination: BannerPagination = data.pagination;

      // Move to a valid page if the requested page no longer exists.
      const safePage = nextPagination.totalPages > 0 ? Math.min( requestedPage, nextPagination.totalPages ) : 1;

      if (safePage !== requestedPage) {
        setPagination((previous) => ({
          ...previous,
          page: safePage,
        }));

        // The changed page triggers another fetch.
        return;
      }

      setBanners(data.banners);
      setPagination(nextPagination);
    } catch (error) {
      setError( error instanceof Error ? error.message : "Failed to fetch banners." );
    } finally {
      setLoading(false);
    }
  }, [buildQueryString, pagination.page]);

  useEffect(() => {
    void fetchBanners();
  }, [fetchBanners]);

  /*
   * Search.
   */
  const setSearch = useCallback((value: string) => {
    setFilters((previous) => ({
      ...previous,
      search: value,
    }));

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  }, []);

  /*
   * Store filter.
   */
  const setStore = useCallback((value: string) => {
    setFilters((previous) => ({
      ...previous,
      store: value,
    }));

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  }, []);

  /*
   * Active/inactive filter.
   */
  const setIsActive = useCallback((value: string) => {
    setFilters((previous) => ({
      ...previous,
      isActive: value,
    }));

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  }, []);

  /*
   * Country filter.
   */
  const setCountry = useCallback((value: string) => {
    setFilters((previous) => ({
      ...previous,
      country: value,
    }));

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  }, []);

  /*
   * Pagination.
   */
  const setPage = useCallback((page: number) => {
    setPagination((previous) => ({
      ...previous,
      page,
    }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((previous) => ({
      ...previous,
      limit,
      page: 1,
    }));
  }, []);

  /*
   * Clear all filters.
   */
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  }, []);

  /*
   * Refresh.
   */
  const refresh = useCallback(async () => {
    await fetchBanners();
  }, [fetchBanners]);

  /*
   * Create banner.
   */
  const createBanner = useCallback(
    async (bannerData: Record<string, unknown>) => {
      const response = await fetch("/api/admin/banners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(bannerData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getApiErrorMessageOnUi(
            data,
            "Failed to create banner."
          )
        );
      }

      // Show the new banner on the first page.
      setPagination((previous) => ({
        ...previous,
        page: 1,
      }));

      await fetchBanners();

      return data.banner as Banner;
    },
    [fetchBanners]
  );

  /*
   * Update banner.
   */
  const updateBanner = useCallback(
    async (
      id: string,
      bannerData: Record<string, unknown>
    ) => {
      const response = await fetch(
        `/api/admin/banners/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(bannerData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getApiErrorMessageOnUi(
            data,
            "Failed to update banner."
          )
        );
      }

      await fetchBanners();

      return data.banner as Banner;
    },
    [fetchBanners]
  );

  /*
   * Delete banner.
   */
  const deleteBanner = useCallback( async (id: string) => {
      const response = await fetch(
        `/api/admin/banners/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getApiErrorMessageOnUi(
            data,
            "Failed to delete banner."
          )
        );
      }

      await fetchBanners();
    },
    [fetchBanners]
  );

  return {
    banners,
    pagination,
    filters,
    loading,
    error,
    setSearch,
    setStore,
    setIsActive,
    setCountry,
    setPage,
    setLimit,
    refresh,
    createBanner,
    updateBanner,
    deleteBanner,
    clearFilters,
  };
}
