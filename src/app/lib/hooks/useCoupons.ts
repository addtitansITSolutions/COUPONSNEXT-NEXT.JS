"use client";
import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessageOnUi } from "@/lib/errors/getApiErrorMessageOnUi";

export interface CouponStore {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  storeBanner?: string;
  isActive: boolean;
}

export interface CouponCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Coupon {
  id: string;
  title: string;
  slug: string;
  description?: string;
  type: "code" | "deal";
  code?: string;
  image?: string;
  store: CouponStore | null;
  category: CouponCategory | null;
  discount?: string;
  affiliateUrl: string;
  country?: string;
  startsAt?: string | null;
  expiresAt?: string | null;
  status: "draft" | "published" | "expired";
  isActive: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CouponFilters {
  search: string;
  store: string;
  category: string;
  type: string;
  status: string;
  isActive: string;
  isFeatured: string;
  isVerified: string;
  country: string;
}

interface CouponPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UseCouponsOptions {
  initialLimit?: number;
}

interface UseCouponsReturn {
  coupons: Coupon[];
  pagination: CouponPagination;
  filters: CouponFilters;
  loading: boolean;
  error: string | null;

  setSearch: (value: string) => void;
  setStore: (value: string) => void;
  setCategory: (value: string) => void;
  setType: (value: string) => void;
  setStatus: (value: string) => void;
  setIsActive: (value: string) => void;
  setIsFeatured: (value: string) => void;
  setIsVerified: (value: string) => void;
  setCountry: (value: string) => void;

  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  refresh: () => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  updateCoupon: (
    id: string,
    data: Record<string, unknown>
  ) => Promise<Coupon>;
  clearFilters: () => void;
}

const DEFAULT_FILTERS: CouponFilters = {
  search: "",
  store: "",
  category: "",
  type: "",
  status: "",
  isActive: "",
  isFeatured: "",
  isVerified: "",
  country: "",
};

const DEFAULT_PAGINATION: CouponPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export function useCoupons( options: UseCouponsOptions = {} ): UseCouponsReturn {
  const initialLimit = options.initialLimit ?? 10;

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pagination, setPagination] = useState<CouponPagination>({
    ...DEFAULT_PAGINATION,
    limit: initialLimit,
  });
  const [filters, setFilters] = useState<CouponFilters>(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [filters.search]);

  // Build API query string
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();

    params.set("page", String(pagination.page));
    params.set("limit", String(pagination.limit));

    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    }

    if (filters.store) params.set("store", filters.store);
    if (filters.category) params.set("category", filters.category);
    if (filters.type) params.set("type", filters.type);
    if (filters.status) params.set("status", filters.status);
    if (filters.isActive) params.set("isActive", filters.isActive);
    if (filters.isFeatured) params.set("isFeatured", filters.isFeatured);
    if (filters.isVerified) params.set("isVerified", filters.isVerified);
    if (filters.country) params.set("country", filters.country);

    return params.toString();
  }, [
    pagination.page,
    pagination.limit,
    debouncedSearch,
    filters.store,
    filters.category,
    filters.type,
    filters.status,
    filters.isActive,
    filters.isFeatured,
    filters.isVerified,
    filters.country,
  ]);

  // Fetch coupons
  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const requestedPage = pagination.page;
      const queryString = buildQueryString();

      const response = await fetch(
        `/api/admin/coupons?${queryString}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getApiErrorMessageOnUi(data, "Failed to fetch coupons.")
        );
      }

      const nextPagination: CouponPagination = data.pagination;

      // Keep the current page within the valid range
      const safePage = nextPagination.totalPages > 0 ? Math.min(requestedPage, nextPagination.totalPages) : 1;

      if (safePage !== requestedPage) {
        setPagination((prev) => ({
          ...prev,
          page: safePage,
        }));
        return;
      }

      setCoupons(data.coupons);
      setPagination(nextPagination);
    } catch (err) {
      setError( err instanceof Error ? err.message : "Failed to fetch coupons." );
    } finally {
      setLoading(false);
    }
  }, [pagination.page, buildQueryString]);

  useEffect(() => {
    void fetchCoupons();
  }, [fetchCoupons]);

  // Filter setters
  const setSearch = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setStore = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, store: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setCategory = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, category: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setType = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, type: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setStatus = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, status: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setIsActive = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, isActive: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setIsFeatured = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, isFeatured: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setIsVerified = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, isVerified: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setCountry = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, country: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Pagination setters
  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({
      ...prev,
      limit,
      page: 1,
    }));
  }, []);

  // Refresh list
  const refresh = useCallback(async () => {
    await fetchCoupons();
  }, [fetchCoupons]);

  // Delete coupon
  const deleteCoupon = useCallback(
    async (id: string) => {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getApiErrorMessageOnUi(data, "Failed to delete coupon.")
        );
      }

      await fetchCoupons();
    },
    [fetchCoupons]
  );

  // Update coupon
  const updateCoupon = useCallback( async ( id: string, updateData: Record<string, unknown> ): Promise<Coupon> => {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getApiErrorMessageOnUi(data, "Failed to update coupon.")
        );
      }

      await fetchCoupons();

      return data.coupon as Coupon;
    },
    [fetchCoupons]
  );

  // Clear all filters
  const clearFilters = useCallback(() => { 
    setFilters(DEFAULT_FILTERS);
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  return {
    coupons,
    pagination,
    filters,
    loading,
    error,

    setSearch,
    setStore,
    setCategory,
    setType,
    setStatus,
    setIsActive,
    setIsFeatured,
    setIsVerified,
    setCountry,

    setPage,
    setLimit,

    refresh,
    deleteCoupon,
    updateCoupon,
    clearFilters,
  };
}
