"use client";
import { useCallback, useEffect, useRef, useState, } from "react";
import { Tag } from "lucide-react";
import type { CouponItem } from "@/components/public/coupons/CouponCard";
import CouponLoading from "@/components/public/coupons/CouponLoading";
import CouponErrorState from "@/components/public/coupons/CouponErrorState";
import CouponGrid from "@/components/public/coupons/CouponGrid";
import CouponResultsCount from "@/components/public/coupons/CouponResultsCount";
import CouponLoadMore from "@/components/public/coupons/CouponLoadMore";

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

interface CategoryCouponsSectionProps {
  categorySlug: string;
  categoryName: string;
}

const PAGE_LIMIT = 8;

export default function CategoryCouponsSection({
  categorySlug,
  categoryName,
}: CategoryCouponsSectionProps) {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [pagination, setPagination] = useState<CouponPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);
  const loadMoreControllerRef = useRef<AbortController | null>(null);

  // Build API query parameters.
  // Category is fixed and cannot be changed by other filters.
  const buildQuery = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(PAGE_LIMIT));
      params.set("sort", "popular");
      params.set("category", categorySlug);
      return params.toString();
    },
    [categorySlug]
  );

  // Fetch the first page whenever the category changes.
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
              "Failed to load category coupons."
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

  // Cancel pending pagination requests on unmount.
  useEffect(() => {
    return () => {
      loadMoreControllerRef.current?.abort();
      loadingMoreRef.current = false;
    };
  }, []);

  // Retry the first-page request.
  const handleRetry = useCallback(() => {
    setError("");
    setLoadMoreError("");
    setRetryKey((previous) => previous + 1);
  }, []);

  return (
    <section
      aria-labelledby="category-coupons-heading"
      className="bg-white py-10 sm:py-14 lg:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex items-center justify-between">
            <div className="mb-7 sm:mb-9">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--brand-purple)]">
                    <Tag size={17} />
                    <span>Coupons & Deals</span>
                </div>

                <h2
                    id="category-coupons-heading"
                    className="text-2xl font-extrabold tracking-tight text-[var(--brand-navy)] sm:text-3xl"
                >
                    {categoryName} Coupons & Deals
                </h2>
            </div>

            {/* Results Count */}
            {!loading && !error && (
            <CouponResultsCount
                count={coupons.length}
                total={pagination?.total}
            />
            )}
        </div>

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
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-gray-50 px-5 py-12 text-center">
            <Tag
              size={30}
              className="mx-auto text-[var(--muted)]"
            />

            <h3 className="mt-3 text-base font-bold text-[var(--brand-navy)]">
              No coupons available
            </h3>

            <p className="mt-1 text-sm text-[var(--muted)]">
              There are currently no coupons in {categoryName}.
              Check back soon for new offers!
            </p>
          </div>
        )}

        {/* Coupon Grid */}
        {!loading && !error && coupons.length > 0 && (
          <>
            <CouponGrid
              coupons={coupons}
              showDesktopFilters={false}
            />

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
                  onClick={() => void loadMore()}
                  className="mt-3 text-sm font-bold text-[var(--brand-purple)] hover:underline"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* End of Categories */}
            {!pagination?.hasNextPage &&
              !loadingMore &&
              !loadMoreError && (
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-sm text-[var(--muted)]">
                    You&apos;ve explored all the {categoryName} offers.
                    Check back for more!
                  </p>
                </div>
              )}
          </>
        )}
      </div>
    </section>
  );
}
