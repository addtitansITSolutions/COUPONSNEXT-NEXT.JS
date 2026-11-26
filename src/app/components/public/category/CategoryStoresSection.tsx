
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Store,
} from "lucide-react";

import StoreCard from "@/components/public/stores/StoreCard";
import type { StoreItem } from "@/components/public/stores/StoresClient";

interface CategoryStoresResponse {
  success: boolean;
  stores: StoreItem[];
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface CategoryStoresSectionProps {
  categorySlug: string;
  categoryName: string;
}

const PAGE_LIMIT = 8;

export default function CategoryStoresSection({
  categorySlug,
  categoryName,
}: CategoryStoresSectionProps) {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentIndex = useRef(0);
  const isPaused = useRef(false);
  const isResetting = useRef(false);

  // Fetch the first 8 stores from the selected category.
  useEffect(() => {
    const controller = new AbortController();
    let isCurrentRequest = true;

    const fetchCategoryStores = async () => {
      setLoading(true);
      setError("");
      setStores([]);
      setActiveIndex(0);
      currentIndex.current = 0;

      try {
        const params = new URLSearchParams({
          category: categorySlug,
          page: "1",
          limit: String(PAGE_LIMIT),
        });

        const response = await fetch(
          `/api/public/stores?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result =
          (await response.json()) as CategoryStoresResponse;

        if (!response.ok || !result.success) {
          throw new Error("Unable to load stores. Please try again.");
        }

        if (isCurrentRequest) {
          setStores(result.stores ?? []);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        if (!isCurrentRequest) return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading stores."
        );
      } finally {
        if (isCurrentRequest) {
          setLoading(false);
        }
      }
    };

    void fetchCategoryStores();

    return () => {
      isCurrentRequest = false;
      controller.abort();
    };
  }, [categorySlug]);

  // Duplicate stores for seamless infinite scrolling.
  const duplicatedStores =
    stores.length > 1 ? [...stores, ...stores] : stores;

  // Scroll to a particular store.
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

  // Next store.
  const nextSlide = useCallback(() => {
    if (stores.length <= 1 || isResetting.current) return;

    const count = stores.length;
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
  }, [stores.length, scrollToIndex]);

  // Previous store.
  const previousSlide = useCallback(() => {
    if (stores.length <= 1 || isResetting.current) return;

    const count = stores.length;
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
  }, [stores.length, scrollToIndex]);

  // Update active indicator when manually scrolling.
  const handleScroll = useCallback(() => {
    const carousel = carouselRef.current;

    if (!carousel || stores.length === 0 || isResetting.current) {
      return;
    }

    const carouselCenter =
      carousel.scrollLeft + carousel.clientWidth / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    cardRefs.current.forEach((card, index) => {
      if (!card || index >= stores.length) return;

      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(carouselCenter - cardCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    currentIndex.current = closestIndex;
    setActiveIndex(closestIndex);
  }, [stores.length]);

  // Automatic carousel movement.
  useEffect(() => {
    if (stores.length <= 1) return;

    const interval = window.setInterval(() => {
      if (!isPaused.current) {
        nextSlide();
      }
    }, 3500);

    return () => window.clearInterval(interval);
  }, [stores.length, nextSlide]);

  // Reset carousel when the category changes.
  useEffect(() => {
    currentIndex.current = 0;
    setActiveIndex(0);

    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: 0,
        behavior: "instant",
      });
    }
  }, [categorySlug, stores.length]);

  const viewAllHref = `/stores?category=${encodeURIComponent(categorySlug)}`;

  return (
    <section className="relative overflow-hidden bg-white py-10 sm:py-14 lg:py-16">
      {/* Background Decoration */}
      <div className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-[var(--brand-purple)]/[0.04] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-9">
          <div>
            {/* <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--brand-purple)]">
              <Store size={17} />
              <span>Explore Stores</span>
              <Sparkles
                size={15}
                className="text-[var(--brand-yellow)]"
              />
            </div> */}

            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--brand-navy)] sm:text-3xl">
              Popular {categoryName} Stores
            </h2>

            {/* <p className="mt-2 text-sm leading-6 text-[var(--muted)] sm:text-base">
              Explore popular stores and discover exclusive offers in{" "}
              {categoryName}.
            </p> */}
          </div>

          {!loading && !error && stores.length > 0 && (
            <div className="flex items-center gap-3">
              <Link
                href={viewAllHref}
                className="hidden shrink-0 items-center gap-2 text-sm font-bold text-[var(--brand-purple)] transition hover:text-[var(--accent-hover)] md:inline-flex"
              >
                View All Stores
                <ArrowRight size={17} />
              </Link>

              {stores.length > 1 && (
                <div className="hidden items-center gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={previousSlide}
                    aria-label="Previous stores"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--brand-navy)] shadow-sm transition hover:border-[var(--brand-purple)] hover:bg-[var(--brand-purple)] hover:text-white"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next stores"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--brand-navy)] shadow-sm transition hover:border-[var(--brand-purple)] hover:bg-[var(--brand-purple)] hover:text-white"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="h-24 rounded-xl bg-gray-100" />
                <div className="mt-5 h-20 w-20 rounded-2xl bg-gray-100" />
                <div className="mt-4 space-y-3">
                  <div className="h-5 w-2/3 rounded bg-gray-100" />
                  <div className="h-4 w-1/3 rounded bg-gray-100" />
                  <div className="h-4 w-full rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
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
        )}

        {/* Empty State */}
        {!loading && !error && stores.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-gray-50 px-5 py-12 text-center">
            <Store size={30} className="mx-auto text-[var(--muted)]" />

            <h3 className="mt-3 text-base font-bold text-[var(--brand-navy)]">
              No stores found
            </h3>

            <p className="mt-1 text-sm text-[var(--muted)]">
              There are currently no stores in this category. Check back soon!
            </p>
          </div>
        )}

        {/* Stores Carousel */}
        {!loading && !error && stores.length > 0 && (
          <>
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
              {duplicatedStores.map((store, index) => (
                <div
                  key={`${store.id}-${index}`}
                  ref={(element) => {
                    cardRefs.current[index] = element;
                  }}
                  aria-hidden={index >= stores.length}
                  className="flex w-[calc((100%-16px)/2)] shrink-0 snap-start flex-col sm:w-[calc((100%-20px)/2)] md:w-[calc((100%-40px)/3)] lg:w-[calc((100%-72px)/4)]"
                >
                  <StoreCard store={store} />
                </div>
              ))}
            </div>

            {/* Mobile View All */}
            <div className="mt-7 text-center md:hidden">
              <Link
                href={viewAllHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-purple)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]"
              >
                View All Stores
                <ArrowRight size={17} />
              </Link>
            </div>

            {/* Carousel Indicators */}
            {stores.length > 1 && (
              <div className="mt-5 flex items-center justify-center gap-1.5">
                {stores.map((store, index) => (
                  <button
                    key={store.id}
                    type="button"
                    aria-label={`Go to store ${index + 1}`}
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
