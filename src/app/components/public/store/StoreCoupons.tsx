"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2, TicketPercent } from "lucide-react";

import CouponCard, {
  type CouponItem,
} from "@/components/public/coupons/CouponCard";

import CouponFilters, {
  type CouponFiltersState,
  type CouponFilterCategory,
  type CouponFilterCountry,
} from "@/components/public/coupons/CouponFilters";

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

  const [retryKey, setRetryKey] = useState(0);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);
  const loadMoreControllerRef = useRef<AbortController | null>(null);

  const filtersKey = useMemo(
    () => JSON.stringify(filters),
    [filters]
  );

  const buildQuery = useCallback(
    (page: number) => {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", "1");
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

    loadingMoreRef.current = false;
    loadMoreControllerRef.current?.abort();

    setLoading(true);
    setLoadingMore(false);
    setError("");
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

        setCoupons(result?.coupons ?? []);
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
        setError(
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
    pagination?.hasNextPage,
    coupons.length,
  ]);

  // Cancel any pending pagination request when filters change.
  useEffect(() => {
    return () => {
      loadMoreControllerRef.current?.abort();
      loadingMoreRef.current = false;
    };
  }, [filtersKey, retryKey, storeId]);

  const handleRetry = () => {
    setError("");
    setRetryKey((previous) => previous + 1);
  };

  return (
    <section
      aria-labelledby="store-coupons-heading"
      className="bg-white py-10 sm:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-7 sm:mb-9">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--brand-purple)] sm:text-sm">
            Find your savings
          </p>

          <h2
            id="store-coupons-heading"
            className="text-2xl font-extrabold text-[var(--brand-navy)] sm:text-3xl"
          >
            Latest Coupons & Deals
          </h2>

          <p className="mt-2 text-sm text-[var(--muted)] sm:text-base">
            Explore the latest offers and discounts available
            for this store.
          </p>
        </div>

        {/* Filters + Coupons */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">
          {/* Filters */}
          <CouponFilters
            categories={categories}
            countries={countries}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
          />

          {/* Coupon Results */}
          <div className="min-w-0">
            {/* Results Count */}
            {!loading && !error && (
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-sm text-[var(--muted)]">
                  Showing{" "}
                  <span className="font-bold text-[var(--brand-navy)]">
                    {coupons.length}
                  </span>
                  {pagination && (
                    <>
                      {" "}of{" "}
                      <span className="font-bold text-[var(--brand-navy)]">
                        {pagination.total}
                      </span>
                    </>
                  )}{" "}
                  coupons
                </p>
              </div>
            )}

            {/* Initial Loading */}
            {loading && (
              <div
                className="flex min-h-[300px] items-center justify-center"
                role="status"
              >
                <div className="flex flex-col items-center gap-3">
                  <Loader2
                    size={32}
                    className="animate-spin text-[var(--brand-purple)]"
                  />
                  <p className="text-sm text-[var(--muted)]">
                    Loading coupons...
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-white px-5 py-10 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-light)] text-[var(--brand-purple)]">
                  <TicketPercent size={26} />
                </div>

                <h3 className="text-lg font-bold text-[var(--brand-navy)]">
                  Unable to load coupons
                </h3>

                <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-5 rounded-xl bg-[var(--brand-purple)] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-hover)]"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && coupons.length === 0 && (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] px-5 py-10 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-light)] text-[var(--brand-purple)]">
                  <TicketPercent size={26} />
                </div>

                <h3 className="text-lg font-bold text-[var(--brand-navy)]">
                  No coupons found
                </h3>

                <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
                  We couldn't find any coupons matching your
                  selected filters. Try changing or clearing
                  your filters.
                </p>

                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-5 rounded-xl border border-[var(--brand-purple)] px-6 py-2.5 text-sm font-bold text-[var(--brand-purple)] transition-colors hover:bg-[var(--accent-light)]"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Coupon Grid */}
            {!loading && !error && coupons.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
                  {coupons.map((coupon) => (
                    <CouponCard
                      key={coupon.id}
                      coupon={coupon}
                    />
                  ))}
                </div>

                {/* Infinite Scroll Trigger */}
                <div
                  ref={observerRef}
                  className="flex min-h-16 items-center justify-center py-5"
                >
                  {loadingMore && (
                    <div
                      className="flex items-center gap-2 text-sm text-[var(--muted)]"
                      role="status"
                    >
                      <Loader2
                        size={19}
                        className="animate-spin text-[var(--brand-purple)]"
                      />
                      Loading more coupons...
                    </div>
                  )}

                  {!pagination?.hasNextPage && (
                    <p className="text-xs text-[var(--muted)]">
                      You've reached the end of the coupons.
                    </p>
                  )}
                </div>

                {/* Load More Error */}
                {!loading && error && (
                  <div className="py-5 text-center">
                    <p className="text-sm text-[var(--muted)]">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={handleRetry}
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
    </section>
  );
}
