// "use client";
// import { useCallback, useEffect, useRef, useState, } from "react";
// import { Tag } from "lucide-react";
// import type { CouponItem } from "@/components/public/coupons/CouponCard";
// import CouponLoading from "@/components/public/coupons/CouponLoading";
// import CouponErrorState from "@/components/public/coupons/CouponErrorState";
// import CouponGrid from "@/components/public/coupons/CouponGrid";
// import CouponResultsCount from "@/components/public/coupons/CouponResultsCount";
// import CouponLoadMore from "@/components/public/coupons/CouponLoadMore";

// interface CouponPagination {
//   page: number;
//   limit: number;
//   total: number;
//   totalPages: number;
//   hasNextPage: boolean;
//   hasPreviousPage: boolean;
// }

// interface CouponsApiResponse {
//   success: boolean;
//   coupons: CouponItem[];
//   pagination: CouponPagination;
//   message?: string;
//   error?: string;
// }

// interface CategoryCouponsSectionProps {
//   categorySlug: string;
//   categoryName: string;
// }

// const PAGE_LIMIT = 8;

// export default function CategoryCouponsSection({
//   categorySlug,
//   categoryName,
// }: CategoryCouponsSectionProps) {
//   const [coupons, setCoupons] = useState<CouponItem[]>([]);
//   const [pagination, setPagination] = useState<CouponPagination | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [error, setError] = useState("");
//   const [loadMoreError, setLoadMoreError] = useState("");
//   const [retryKey, setRetryKey] = useState(0);
//   const observerRef = useRef<HTMLDivElement | null>(null);
//   const loadingMoreRef = useRef(false);
//   const loadMoreControllerRef = useRef<AbortController | null>(null);

//   // Build API query parameters.
//   // Category is fixed and cannot be changed by other filters.
//   const buildQuery = useCallback(
//     (page: number) => {
//       const params = new URLSearchParams();
//       params.set("page", String(page));
//       params.set("limit", String(PAGE_LIMIT));
//       params.set("sort", "popular");
//       params.set("category", categorySlug);
//       return params.toString();
//     },
//     [categorySlug]
//   );

//   // Fetch the first page whenever the category changes.
//   useEffect(() => {
//     const controller = new AbortController();
//     let isCurrentRequest = true;
//     // Cancel any ongoing pagination request.
//     loadingMoreRef.current = false;
//     loadMoreControllerRef.current?.abort();
//     loadMoreControllerRef.current = null;
//     setLoading(true);
//     setLoadingMore(false);
//     setError("");
//     setLoadMoreError("");
//     setCoupons([]);
//     setPagination(null);

//     const timer = window.setTimeout(async () => {
//       try {
//         const response = await fetch(
//           `/api/public/coupons?${buildQuery(1)}`,
//           {
//             method: "GET",
//             cache: "no-store",
//             signal: controller.signal,
//           }
//         );

//         const result =
//           (await response.json()) as CouponsApiResponse;

//         if (!response.ok || !result.success) {
//           throw new Error(
//             result.message ||
//               result.error ||
//               "Failed to load category coupons."
//           );
//         }

//         if (!isCurrentRequest) return;

//         setCoupons(result.coupons ?? []);
//         setPagination(result.pagination ?? null);
//       } catch (err) {
//         if (
//           err instanceof Error &&
//           err.name === "AbortError"
//         ) {
//           return;
//         }

//         if (!isCurrentRequest) return;

//         setError(
//           err instanceof Error
//             ? err.message
//             : "Something went wrong while loading coupons."
//         );
//       } finally {
//         if (isCurrentRequest) {
//           setLoading(false);
//         }
//       }
//     }, 300);

//     return () => {
//       isCurrentRequest = false;
//       window.clearTimeout(timer);
//       controller.abort();
//     };
//   }, [buildQuery, retryKey]);

//   // Load the next page.
//   const loadMore = useCallback(async () => {
//     if (
//       !pagination?.hasNextPage ||
//       loading ||
//       loadingMoreRef.current ||
//       error
//     ) {
//       return;
//     }

//     setLoadMoreError("");

//     loadingMoreRef.current = true;

//     const controller = new AbortController();
//     loadMoreControllerRef.current = controller;

//     setLoadingMore(true);

//     try {
//       const nextPage = pagination.page + 1;

//       const response = await fetch(
//         `/api/public/coupons?${buildQuery(nextPage)}`,
//         {
//           method: "GET",
//           cache: "no-store",
//           signal: controller.signal,
//         }
//       );

//       const result =
//         (await response.json()) as CouponsApiResponse;

//       if (!response.ok || !result.success) {
//         throw new Error(
//           result.message ||
//             result.error ||
//             "Failed to load more coupons."
//         );
//       }

//       if (controller.signal.aborted) return;

//       // Prevent duplicate coupons.
//       setCoupons((previous) => {
//         const existingIds = new Set(
//           previous.map((coupon) => coupon.id)
//         );

//         const newCoupons = (result.coupons ?? []).filter(
//           (coupon) => !existingIds.has(coupon.id)
//         );

//         return [...previous, ...newCoupons];
//       });

//       setPagination(result.pagination ?? null);
//     } catch (err) {
//       if (
//         err instanceof Error &&
//         err.name === "AbortError"
//       ) {
//         return;
//       }

//       if (!controller.signal.aborted) {
//         setLoadMoreError(
//           err instanceof Error
//             ? err.message
//             : "Failed to load more coupons."
//         );
//       }
//     } finally {
//       if (loadMoreControllerRef.current === controller) {
//         loadMoreControllerRef.current = null;
//         loadingMoreRef.current = false;
//         setLoadingMore(false);
//       }
//     }
//   }, [pagination, loading, error, buildQuery]);

//   // Infinite scroll observer.
//   useEffect(() => {
//     const element = observerRef.current;

//     if (
//       !element ||
//       loading ||
//       loadingMore ||
//       error ||
//       loadMoreError ||
//       !pagination?.hasNextPage
//     ) {
//       return;
//     }

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0]?.isIntersecting) {
//           void loadMore();
//         }
//       },
//       {
//         root: null,
//         rootMargin: "300px",
//         threshold: 0,
//       }
//     );

//     observer.observe(element);

//     return () => observer.disconnect();
//   }, [
//     loadMore,
//     loading,
//     loadingMore,
//     error,
//     loadMoreError,
//     pagination?.hasNextPage,
//     coupons.length,
//   ]);

//   // Cancel pending pagination requests on unmount.
//   useEffect(() => {
//     return () => {
//       loadMoreControllerRef.current?.abort();
//       loadingMoreRef.current = false;
//     };
//   }, []);

//   // Retry the first-page request.
//   const handleRetry = useCallback(() => {
//     setError("");
//     setLoadMoreError("");
//     setRetryKey((previous) => previous + 1);
//   }, []);

//   return (
//     <section
//       aria-labelledby="category-coupons-heading"
//       className="bg-white py-10 sm:py-14 lg:py-16"
//     >
//       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//         {/* Section Heading */}
//         <div className="flex items-center justify-between">
//             <div className="mb-7 sm:mb-9">
//                 <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--brand-purple)]">
//                     <Tag size={17} />
//                     <span>Coupons & Deals</span>
//                 </div>

//                 <h2
//                     id="category-coupons-heading"
//                     className="text-2xl font-extrabold tracking-tight text-[var(--brand-navy)] sm:text-3xl"
//                 >
//                     {categoryName} Coupons & Deals
//                 </h2>
//             </div>

//             {/* Results Count */}
//             {!loading && !error && (
//             <CouponResultsCount
//                 count={coupons.length}
//                 total={pagination?.total}
//             />
//             )}
//         </div>

//         {/* Loading State */}
//         {loading && <CouponLoading />}

//         {/* Initial Error State */}
//         {!loading && error && (
//           <CouponErrorState
//             message={error}
//             onRetry={handleRetry}
//           />
//         )}

//         {/* Empty State */}
//         {!loading && !error && coupons.length === 0 && (
//           <div className="rounded-2xl border border-dashed border-[var(--border)] bg-gray-50 px-5 py-12 text-center">
//             <Tag
//               size={30}
//               className="mx-auto text-[var(--muted)]"
//             />

//             <h3 className="mt-3 text-base font-bold text-[var(--brand-navy)]">
//               No coupons available
//             </h3>

//             <p className="mt-1 text-sm text-[var(--muted)]">
//               There are currently no coupons in {categoryName}.
//               Check back soon for new offers!
//             </p>
//           </div>
//         )}

//         {/* Coupon Grid */}
//         {!loading && !error && coupons.length > 0 && (
//           <>
//             <CouponGrid
//               coupons={coupons}
//               showDesktopFilters={false}
//             />

//             {/* Infinite Scroll Trigger */}
//             <CouponLoadMore
//               observerRef={observerRef}
//               loadingMore={loadingMore}
//               hasNextPage={pagination?.hasNextPage ?? false}
//             />

//             {/* Load More Error */}
//             {loadMoreError && (
//               <div className="py-5 text-center">
//                 <p className="text-sm text-[var(--muted)]">
//                   {loadMoreError}
//                 </p>

//                 <button
//                   type="button"
//                   onClick={() => void loadMore()}
//                   className="mt-3 text-sm font-bold text-[var(--brand-purple)] hover:underline"
//                 >
//                   Try Again
//                 </button>
//               </div>
//             )}

//             {/* End of Categories */}
//             {!pagination?.hasNextPage &&
//               !loadingMore &&
//               !loadMoreError && (
//                 <div className="flex flex-col items-center justify-center text-center">
//                   <p className="text-sm text-[var(--muted)]">
//                     You&apos;ve explored all the {categoryName} offers.
//                     Check back for more!
//                   </p>
//                 </div>
//               )}
//           </>
//         )}
//       </div>
//     </section>
//   );
// }




"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import type { CouponItem } from "@/components/public/coupons/CouponCard";
import CouponCard from "@/components/public/coupons/CouponCard";

interface CouponsApiResponse {
  success: boolean;
  coupons: CouponItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentIndex = useRef(0);
  const isPaused = useRef(false);
  const isResetting = useRef(false);

  useEffect(() => {
    let isCurrentRequest = true;
    const controller = new AbortController();

    const fetchCoupons = async () => {
      setLoading(true);
      setError("");
      setCoupons([]);
      setActiveIndex(0);
      currentIndex.current = 0;

      try {
        const params = new URLSearchParams({
          category: categorySlug,
          page: "1",
          limit: String(PAGE_LIMIT),
          sort: "popular",
        });

        const response = await fetch(
          `/api/public/coupons?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result = (await response.json()) as CouponsApiResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              result.error ||
              "Failed to load category coupons."
          );
        }

        if (isCurrentRequest) {
          setCoupons(result.coupons ?? []);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        if (isCurrentRequest) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading coupons."
          );
        }
      } finally {
        if (isCurrentRequest) {
          setLoading(false);
        }
      }
    };

    void fetchCoupons();

    return () => {
      isCurrentRequest = false;
      controller.abort();
    };
  }, [categorySlug]);

  // Duplicate coupons to create the infinite carousel loop.
  const duplicatedCoupons =
    coupons.length > 1 ? [...coupons, ...coupons] : coupons;

  // Scroll to a particular coupon.
  const scrollToIndex = useCallback(
    (index: number, smooth = true) => {
      const carousel = carouselRef.current;
      const card = cardRefs.current[index];

      if (!carousel || !card) return;

      carousel.scrollTo({
        left: card.offsetLeft - carousel.offsetLeft,
        behavior: smooth ? "smooth" : "instant",
      });
    },
    []
  );

  // Next coupon.
  const nextSlide = useCallback(() => {
    if (coupons.length <= 1 || isResetting.current) return;

    const count = coupons.length;
    const nextIndex = currentIndex.current + 1;

    if (nextIndex >= count) {
      isResetting.current = true;
      scrollToIndex(count, false);

      requestAnimationFrame(() => {
        currentIndex.current = 1;
        setActiveIndex(1);
        scrollToIndex(count + 1, true);

        requestAnimationFrame(() => {
          isResetting.current = false;
        });
      });

      return;
    }

    currentIndex.current = nextIndex;
    setActiveIndex(nextIndex);
    scrollToIndex(nextIndex, true);
  }, [coupons.length, scrollToIndex]);

  // Previous coupon.
  const previousSlide = useCallback(() => {
    if (coupons.length <= 1 || isResetting.current) return;

    const count = coupons.length;
    const previousIndex = currentIndex.current - 1;

    if (previousIndex < 0) {
      isResetting.current = true;
      scrollToIndex(count, false);

      requestAnimationFrame(() => {
        currentIndex.current = count - 1;
        setActiveIndex(count - 1);
        scrollToIndex(count - 1, true);

        requestAnimationFrame(() => {
          isResetting.current = false;
        });
      });

      return;
    }

    currentIndex.current = previousIndex;
    setActiveIndex(previousIndex);
    scrollToIndex(previousIndex, true);
  }, [coupons.length, scrollToIndex]);

  // Keep indicators synchronized with manual scrolling.
  const handleScroll = useCallback(() => {
    const carousel = carouselRef.current;

    if (!carousel || coupons.length === 0 || isResetting.current) {
      return;
    }

    const carouselCenter =
      carousel.scrollLeft + carousel.clientWidth / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    cardRefs.current.forEach((card, index) => {
      if (!card || index >= coupons.length) return;

      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(carouselCenter - cardCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    currentIndex.current = closestIndex;
    setActiveIndex(closestIndex);
  }, [coupons.length]);

  // Automatic sliding.
  useEffect(() => {
    if (coupons.length <= 1) return;

    const interval = window.setInterval(() => {
      if (!isPaused.current) {
        nextSlide();
      }
    }, 3500);

    return () => window.clearInterval(interval);
  }, [coupons.length, nextSlide]);

  // Reset carousel when category changes.
  // useEffect(() => {
  //   currentIndex.current = 0;
  //   setActiveIndex(0);

  //   if (carouselRef.current) {
  //     carouselRef.current.scrollTo({
  //       left: 0,
  //       behavior: "instant",
  //     });
  //   }
  // }, [categorySlug, coupons.length]);

  if (loading) {
    return null;
  }

  if (!error && coupons.length === 0) {
    return null;
  }

  const viewAllHref = `/coupons?category=${encodeURIComponent(categorySlug)}`;

  return (
    <section
      aria-labelledby="category-coupons-heading"
      className="relative overflow-hidden border-t border-[var(--border)] bg-white py-10 sm:py-14 lg:py-16"
    >
      {/* Background Decoration */}
      <div className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-[var(--brand-purple)]/[0.04] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-9">
          <div>
            {/* <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--brand-purple)]">
              <Tag size={17} />
              <span>Coupons & Deals</span>
              <Sparkles
                size={15}
                className="text-[var(--brand-yellow)]"
              />
            </div> */}

            <h2
              id="category-coupons-heading"
              className="text-2xl font-extrabold tracking-tight text-[var(--brand-navy)] sm:text-3xl"
            >
              {categoryName} Coupons & Deals
            </h2>

            {/* <p className="mt-2 text-sm leading-6 text-[var(--muted)] sm:text-base">
              Discover popular coupon codes and exclusive deals in{" "}
              {categoryName}.
            </p> */}
          </div>

          {coupons.length > 0 && (
            <div className="flex items-center gap-3">
              <Link
                href={viewAllHref}
                className="hidden shrink-0 items-center gap-2 text-sm font-bold text-[var(--brand-purple)] transition hover:text-[var(--accent-hover)] md:inline-flex"
              >
                View All Coupons
                <ArrowRight size={17} />
              </Link>

              {coupons.length > 1 && (
                <div className="hidden items-center gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={previousSlide}
                    aria-label="Previous coupons"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--brand-navy)] shadow-sm transition hover:border-[var(--brand-purple)] hover:bg-[var(--brand-purple)] hover:text-white"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next coupons"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--brand-navy)] shadow-sm transition hover:border-[var(--brand-purple)] hover:bg-[var(--brand-purple)] hover:text-white"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error State */}
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center">
            <p className="text-sm font-medium text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-bold text-[var(--brand-purple)] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* Coupon Carousel */}
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              onMouseEnter={() => {
                isPaused.current = true;
              }}
              onMouseLeave={() => {
                isPaused.current = false;
              }}
              onTouchStart={() => {
                isPaused.current = true;
              }}
              onTouchEnd={() => {
                isPaused.current = false;
              }}
              onFocusCapture={() => {
                isPaused.current = true;
              }}
              onBlurCapture={() => {
                isPaused.current = false;
              }}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5 lg:gap-6"
            >
              {duplicatedCoupons.map((coupon, index) => (
                <div
                  key={`${coupon.id}-${index}`}
                  ref={(element) => {
                    cardRefs.current[index] = element;
                  }}
                  aria-hidden={index >= coupons.length}
                  className="flex h-auto w-[calc((100%-16px)/2)] shrink-0 snap-start self-stretch sm:w-[calc((100%-20px)/2)] md:w-[calc((100%-40px)/3)] lg:w-[calc((100%-72px)/4)]"
                >
                  <div className="flex h-full w-full [&>*]:h-full [&>*]:w-full">
                    <CouponCard coupon={coupon} />
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile View All */}
            <div className="mt-7 text-center md:hidden">
              <Link
                href={viewAllHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-purple)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]"
              >
                View All Coupons
                <ArrowRight size={17} />
              </Link>
            </div>

            {/* Carousel Indicators */}
            {coupons.length > 1 && (
              <div className="mt-5 flex items-center justify-center gap-1.5">
                {coupons.map((coupon, index) => (
                  <button
                    key={coupon.id}
                    type="button"
                    aria-label={`Go to coupon ${index + 1}`}
                    onClick={() => {
                      currentIndex.current = index;
                      setActiveIndex(index);
                      scrollToIndex(index);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeIndex === index
                        ? "w-6 bg-[var(--brand-purple)]"
                        : "w-1.5 bg-[var(--border)] hover:bg-[var(--brand-purple)]/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
