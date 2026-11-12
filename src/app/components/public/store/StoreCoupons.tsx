"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Filter, X } from "lucide-react";

import type { CouponItem } from "@/components/public/coupons/CouponCard";

import CouponFilters, {
  type CouponFiltersState,
  type CouponFilterCategory,
  type CouponFilterCountry,
} from "@/components/public/coupons/CouponFilters";

import CouponLoading from "@/components/public/coupons/CouponLoading";
import CouponEmptyState from "@/components/public/coupons/CouponEmptyState";
import CouponErrorState from "@/components/public/coupons/CouponErrorState";
import CouponGrid from "@/components/public/coupons/CouponGrid";
import CouponResultsCount from "@/components/public/coupons/CouponResultsCount";
import CouponLoadMore from "@/components/public/coupons/CouponLoadMore";

interface StoreCouponsProps {
  storeId: string;
  categories: CouponFilterCategory[];
  countries: CouponFilterCountry[];
}

interface CouponPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface CouponsApiResponse {
  success: boolean;
  coupons: CouponItem[];
  pagination: CouponPagination;
  message?: string;
  error?: string;
}

const INITIAL_FILTERS: CouponFiltersState = {
  search: "",
  category: "",
  type: "",
  isVerified: "",
  isFeatured: "",
  country: "",
  sort: "popular",
};

export default function StoreCoupons({
  storeId,
  categories,
  countries,
}: StoreCouponsProps) {
  const [filters, setFilters] =
    useState<CouponFiltersState>(INITIAL_FILTERS);

  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [pagination, setPagination] =
    useState<CouponPagination | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");

  const [retryKey, setRetryKey] = useState(0);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);
  const loadMoreControllerRef = useRef<AbortController | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filtersKey = useMemo(
    () => JSON.stringify(filters),
    [filters]
  );

  // Build API query parameters.
  const buildQuery = useCallback(
    (page: number) => {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", "16");
      params.set("store", storeId);
      params.set("sort", filters.sort);

      if (filters.search.trim()) {
        params.set("search", filters.search.trim());
      }

      if (filters.category) {
        params.set("category", filters.category);
      }

      if (filters.type) {
        params.set("type", filters.type);
      }

      if (filters.isVerified) {
        params.set("isVerified", filters.isVerified);
      }

      if (filters.isFeatured) {
        params.set("isFeatured", filters.isFeatured);
      }

      if (filters.country) {
        params.set("country", filters.country);
      }

      return params.toString();
    },
    [storeId, filters]
  );

  // Update individual filters.
  const handleFilterChange = useCallback(
    <K extends keyof CouponFiltersState>(
      key: K,
      value: CouponFiltersState[K]
    ) => {
      setFilters((previous) => ({
        ...previous,
        [key]: value,
      }));
    },
    []
  );

  // Reset all filters.
  const handleClearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  // Fetch the first page whenever filters change.
  useEffect(() => {
    const controller = new AbortController();
    let isCurrentRequest = true;

    // Cancel any ongoing pagination request.
    loadingMoreRef.current = false;
    loadMoreControllerRef.current?.abort();
    loadMoreControllerRef.current = null;

    setLoading(true);
    setLoadingMore(false);
    setError("");
    setLoadMoreError("");
    setCoupons([]);
    setPagination(null);

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/public/coupons?${buildQuery(1)}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result =
          (await response.json()) as CouponsApiResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              result.error ||
              "Failed to load coupons."
          );
        }

        if (!isCurrentRequest) return;

        setCoupons(result.coupons ?? []);
        setPagination(result.pagination ?? null);
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }

        if (!isCurrentRequest) return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading coupons."
        );
      } finally {
        if (isCurrentRequest) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      isCurrentRequest = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [buildQuery, retryKey]);

  // Load the next page.
  const loadMore = useCallback(async () => {
    if (
      !pagination?.hasNextPage ||
      loading ||
      loadingMoreRef.current ||
      error
    ) {
      return;
    }

    // Clear any previous pagination error.
    setLoadMoreError("");

    loadingMoreRef.current = true;

    const controller = new AbortController();
    loadMoreControllerRef.current = controller;

    setLoadingMore(true);

    try {
      const nextPage = pagination.page + 1;

      const response = await fetch(
        `/api/public/coupons?${buildQuery(nextPage)}`,
        {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        }
      );

      const result =
        (await response.json()) as CouponsApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            result.error ||
            "Failed to load more coupons."
        );
      }

      if (controller.signal.aborted) return;

      // Prevent duplicate coupons.
      setCoupons((previous) => {
        const existingIds = new Set(
          previous.map((coupon) => coupon.id)
        );

        const newCoupons = (result.coupons ?? []).filter(
          (coupon) => !existingIds.has(coupon.id)
        );

        return [...previous, ...newCoupons];
      });

      setPagination(result.pagination ?? null);
    } catch (err) {
      if (
        err instanceof Error &&
        err.name === "AbortError"
      ) {
        return;
      }

      if (!controller.signal.aborted) {
        setLoadMoreError(
          err instanceof Error
            ? err.message
            : "Failed to load more coupons."
        );
      }
    } finally {
      if (loadMoreControllerRef.current === controller) {
        loadMoreControllerRef.current = null;
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  }, [pagination, loading, error, buildQuery]);

  // Infinite scroll observer.
  useEffect(() => {
    const element = observerRef.current;

    if (
      !element ||
      loading ||
      loadingMore ||
      error ||
      loadMoreError ||
      !pagination?.hasNextPage
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      {
        root: null,
        rootMargin: "300px",
        threshold: 0,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [
    loadMore,
    loading,
    loadingMore,
    error,
    loadMoreError,
    pagination?.hasNextPage,
    coupons.length,
  ]);

  // Cancel pending pagination requests when filters change.
  useEffect(() => {
    return () => {
      loadMoreControllerRef.current?.abort();
      loadingMoreRef.current = false;
    };
  }, [filtersKey, retryKey, storeId]);

  // Retry the first-page request.
  const handleRetry = useCallback(() => {
    setError("");
    setLoadMoreError("");
    setRetryKey((previous) => previous + 1);
  }, []);

  useEffect(() => {
  if (!showMobileFilters) return;

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setShowMobileFilters(false);
    }
  };

  document.addEventListener("keydown", handleEscape);

  return () => {
    document.removeEventListener("keydown", handleEscape);
  };
}, [showMobileFilters]);


const hasActiveFilters = Object.keys(INITIAL_FILTERS).some(
  (key) =>
    filters[key as keyof CouponFiltersState] !==
    INITIAL_FILTERS[key as keyof CouponFiltersState]
);

  return (
    <section
      aria-labelledby="store-coupons-heading"
      className="bg-white py-10 sm:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:mb-9 lg:flex-row lg:items-end">
          <div className="min-w-0">
            {/* <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--brand-purple)] sm:text-sm">
              Find your savings
            </p> */}

            <h2
              id="store-coupons-heading"
              className="text-2xl font-extrabold tracking-tight text-[var(--brand-navy)] sm:text-3xl"
            >
              Latest Coupons & Deals
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              Explore the latest offers and discounts available for this store.
            </p>
          </div>

          <div className="shrink-0 hidden lg:flex lg:pb-1">
            <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--accent-light)] px-3.5 py-2 text-xs font-semibold text-[var(--brand-purple)]">
              Updated offers
            </span>
          </div>
        </div>

        {/* Filters + Coupons */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">
        {/* Filters column (stretches to full row height) */}
          <aside className="hidden lg:block">
            <div className="sticky top-[136px] max-h-[calc(100vh-36px-16px)] overflow-y-auto pr-1 [scrollbar-width:thin]">
              <CouponFilters
                categories={categories}
                countries={countries}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            </div>
          </aside>

          {/* Coupon Results */}
          <div className="min-w-0">

            {/* Mobile Filters Button */}
            <div className="mb-5 flex gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setShowMobileFilters(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-bold text-[var(--brand-navy)] shadow-sm transition hover:border-[var(--brand-purple)]"
              >
                <Filter size={18} className="text-[var(--brand-purple)]" />
                Filters
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-bold text-[var(--brand-purple)] transition hover:bg-[var(--accent-light)]"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Results Count */}
            {!loading && !error && (
              <CouponResultsCount
                count={coupons.length}
                total={pagination?.total}
              />
            )}

            {/* Loading State */}
            {loading && <CouponLoading />}

            {/* Initial Error State */}
            {!loading && error && (
              <CouponErrorState
                message={error}
                onRetry={handleRetry}
              />
            )}

            {/* Empty State */}
            {!loading && !error && coupons.length === 0 && (
              <CouponEmptyState
                onClear={handleClearFilters}
              />
            )}

            {/* Coupon Grid */}
            {!loading && !error && coupons.length > 0 && (
              <>
                <CouponGrid coupons={coupons} />

                {/* Infinite Scroll Trigger */}
                <CouponLoadMore
                  observerRef={observerRef}
                  loadingMore={loadingMore}
                  hasNextPage={pagination?.hasNextPage ?? false}
                />

                {/* Load More Error */}
                {loadMoreError && (
                  <div className="py-5 text-center">
                    <p className="text-sm text-[var(--muted)]">
                      {loadMoreError}
                    </p>

                    <button
                      type="button"
                      onClick={loadMore}
                      className="mt-3 text-sm font-bold text-[var(--brand-purple)] hover:underline"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>



      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[1000] lg:hidden">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setShowMobileFilters(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          />

          {/* Drawer */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
            className="absolute inset-y-0 left-0 flex w-[88%] max-w-[380px] flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-300"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div>
                <h2
                  id="mobile-filter-title"
                  className="text-lg font-extrabold text-[var(--brand-navy)]"
                >
                  Filters
                </h2>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Find the offers that suit you
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                aria-label="Close filters"
                className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)]"
              >
                <X size={21} />
              </button>
            </div>

            {/* Filter Content */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <CouponFilters
                categories={categories}
                countries={countries}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            </div>

            {/* Footer */}
            <div className="flex shrink-0 gap-3 border-t border-[var(--border)] bg-white p-4">
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-bold text-[var(--brand-navy)] transition hover:bg-gray-50"
              >
                Clear All
              </button>

              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 rounded-xl bg-[var(--brand-purple)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]"
              >
                Done
              </button>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}