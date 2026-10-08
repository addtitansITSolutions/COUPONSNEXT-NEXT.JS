"use client";

import { useCallback, useEffect, useState } from "react";

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  storeBanner?: string;
  websiteUrl?: string;
  affiliateUrl?: string;
  country?: string;
  category: StoreCategory | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoreFilters {
  search: string;
  category: string;
  isActive: string;
  isFeatured: string;
  country: string;
}

interface StorePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UseStoresOptions {
  initialLimit?: number;
}

interface UseStoresReturn {
  stores: Store[];
  pagination: StorePagination;

  filters: StoreFilters;

  loading: boolean;
  error: string | null;

  setSearch: (value: string) => void;
  setCategory: (value: string) => void;
  setIsActive: (value: string) => void;
  setIsFeatured: (value: string) => void;
  setCountry: (value: string) => void;

  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  refresh: () => Promise<void>;

  deleteStore: (id: string) => Promise<void>;
  updateStore: (
    id: string,
    data: Record<string, unknown>
  ) => Promise<Store>;

  clearFilters: () => void;
}

const DEFAULT_FILTERS: StoreFilters = {
  search: "",
  category: "",
  isActive: "",
  isFeatured: "",
  country: "",
};

export function useStores( options: UseStoresOptions = {} ): UseStoresReturn {
  const { initialLimit = 20 } = options;

  const [stores, setStores] = useState<Store[]>([]);

  const [pagination, setPagination] = useState<StorePagination>({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [filters, setFilters] =
    useState<StoreFilters>(DEFAULT_FILTERS);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();

    params.set("page", pagination.page.toString());
    params.set("limit", pagination.limit.toString());

    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }

    if (filters.category) {
      params.set("category", filters.category);
    }

    if (filters.isActive) {
      params.set("isActive", filters.isActive);
    }

    if (filters.isFeatured) {
      params.set("isFeatured", filters.isFeatured);
    }

    if (filters.country.trim()) {
      params.set("country", filters.country.trim());
    }

    return params.toString();
  }, [pagination.page, pagination.limit, filters]);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryString = buildQueryString();

      const response = await fetch(
        `/api/admin/store?${queryString}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch stores"
        );
      }

      setStores(data.stores);
      setPagination(data.pagination);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch stores"
      );
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  /*
   * Search
   *
   * Searching should always start from page 1.
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
   * Category filter
   */
  const setCategory = useCallback((value: string) => {
    setFilters((previous) => ({
      ...previous,
      category: value,
    }));

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  }, []);

  /*
   * Active filter
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
   * Featured filter
   */
  const setIsFeatured = useCallback((value: string) => {
    setFilters((previous) => ({
      ...previous,
      isFeatured: value,
    }));

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  }, []);

  /*
   * Country filter
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
   * Pagination
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
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  }, []);

  /*
   * Refresh
   */
  const refresh = useCallback(async () => {
    await fetchStores();
  }, [fetchStores]);

  /*
   * Delete Store
   */
  const deleteStore = useCallback(
    async (id: string) => {
      const response = await fetch(
        `/api/admin/store/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete store"
        );
      }

      /*
       * Do not simply remove the item locally.
       *
       * We refresh from the server so that:
       * - total count is correct
       * - total pages are correct
       * - pagination buttons are correct
       * - current page remains valid
       */
      await fetchStores();
    },
    [fetchStores]
  );

  /*
   * Update Store
   */
  const updateStore = useCallback(
    async (
      id: string,
      dataToUpdate: Record<string, unknown>
    ) => {
      const response = await fetch(
        `/api/admin/store/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(dataToUpdate),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update store"
        );
      }

      /*
       * Refresh the current list after updating.
       *
       * This keeps filters, sorting and pagination
       * synchronized with the database.
       */
      await fetchStores();

      return data.store as Store;
    },
    [fetchStores]
  );

  return {
    stores,
    pagination,
    filters,
    loading,
    error,

    setSearch,
    setCategory,
    setIsActive,
    setIsFeatured,
    setCountry,

    setPage,
    setLimit,

    refresh,

    deleteStore,
    updateStore,

    clearFilters,
  };
}