
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Sparkles,
} from "lucide-react";

import BlogCard from "@/components/public/blogs/BlogCard";
import type { FeaturedBlogItem } from "@/components/public/home/FeaturedBlogsClient";

interface CategoryBlogsResponse {
  success: boolean;
  blogs: FeaturedBlogItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CategoryBlogsSectionProps {
  categorySlug: string;
  categoryName: string;
}

export default function CategoryBlogsSection({
  categorySlug,
  categoryName,
}: CategoryBlogsSectionProps) {
  const [blogs, setBlogs] = useState<FeaturedBlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentIndex = useRef(0);
  const isPaused = useRef(false);
  const isResetting = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);

  const fetchCategoryBlogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        category: categorySlug,
        page: "1",
        limit: "8",
        sort: "default",
      });

      const response = await fetch(
        `/api/public/blogs?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result = (await response.json()) as CategoryBlogsResponse;

      if (!response.ok || !result.success) {
        throw new Error("Unable to load articles. Please try again.");
      }

      setBlogs(result.blogs ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading articles."
      );
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    fetchCategoryBlogs();
  }, [fetchCategoryBlogs]);

  const duplicatedBlogs = blogs.length > 1 ? [...blogs, ...blogs] : blogs;

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

  const nextSlide = useCallback(() => {
    if (blogs.length <= 1 || isResetting.current) return;

    const count = blogs.length;
    let nextIndex = currentIndex.current + 1;

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
  }, [blogs.length, scrollToIndex]);

  const previousSlide = useCallback(() => {
    if (blogs.length <= 1 || isResetting.current) return;

    const count = blogs.length;
    let previousIndex = currentIndex.current - 1;

    if (previousIndex < 0) {
      isResetting.current = true;
      scrollToIndex(count - 1, false);

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
  }, [blogs.length, scrollToIndex]);

  const handleScroll = useCallback(() => {
    const carousel = carouselRef.current;

    if (!carousel || blogs.length === 0 || isResetting.current) return;

    const carouselCenter = carousel.scrollLeft + carousel.clientWidth / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    cardRefs.current.forEach((card, index) => {
      if (!card || index >= blogs.length) return;

      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(carouselCenter - cardCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    currentIndex.current = closestIndex;
    setActiveIndex(closestIndex);
  }, [blogs.length]);

  useEffect(() => {
    if (blogs.length <= 1) return;

    const interval = window.setInterval(() => {
      if (!isPaused.current) {
        nextSlide();
      }
    }, 3500);

    return () => window.clearInterval(interval);
  }, [blogs.length, nextSlide]);

  useEffect(() => {
    currentIndex.current = 0;
    setActiveIndex(0);

    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: 0,
        behavior: "instant",
      });
    }
  }, [categorySlug, blogs.length]);

  if (!loading && blogs.length === 0 && !error) return null;
  if (loading && blogs.length === 0) return null;

  const viewAllHref = `/blog?category=${encodeURIComponent(categorySlug)}`;

  return (
    <section className="relative overflow-hidden border-t border-[var(--border)] bg-white py-10 sm:py-14 lg:py-16">
      {/* Background Decoration */}
      <div className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-[var(--brand-purple)]/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-[var(--brand-yellow)]/[0.08] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-9">
          <div>
            {/* <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--brand-purple)]">
              <BookOpen size={17} />
              <span>Read & Discover</span>
              <Sparkles size={15} className="text-[var(--brand-yellow)]" />
            </div> */}

            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--brand-navy)] sm:text-3xl">
              Latest {categoryName} Articles
            </h2>

            {/* <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              Explore helpful articles, shopping tips, and insights related to{" "}
              {categoryName}.
            </p> */}
          </div>

          {!error && blogs.length > 0 && (
            <div className="flex items-center gap-3">
              <Link
                href={viewAllHref}
                className="hidden shrink-0 items-center gap-2 text-sm font-bold text-[var(--brand-purple)] transition hover:text-[var(--accent-hover)] md:inline-flex"
              >
                View All Articles
                <ArrowRight size={17} />
              </Link>

              {blogs.length > 1 && (
                <div className="hidden items-center gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={previousSlide}
                    aria-label="Previous articles"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--brand-navy)] shadow-sm transition hover:border-[var(--brand-purple)] hover:bg-[var(--brand-purple)] hover:text-white"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next articles"
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
              onClick={fetchCategoryBlogs}
              className="mt-3 text-sm font-bold text-[var(--brand-purple)] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* Articles Carousel */}
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
              {duplicatedBlogs.map((blog, index) => (
                <div
                  key={`${blog.id}-${index}`}
                  ref={(element) => {
                    cardRefs.current[index] = element;
                  }}
                  aria-hidden={index >= blogs.length}
                  className="flex w-[calc((100%-16px)/2)] shrink-0 snap-start flex-col sm:w-[calc((100%-20px)/2)] md:w-[calc((100%-40px)/3)] lg:w-[calc((100%-72px)/4)]"
                >
                  <BlogCard blog={blog} />
                </div>
              ))}
            </div>

            {/* Mobile View All */}
            {blogs.length > 0 && (
              <div className="mt-7 text-center md:hidden">
                <Link
                  href={viewAllHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-purple)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]"
                >
                  View All Articles
                  <ArrowRight size={17} />
                </Link>
              </div>
            )}

            {/* Carousel Indicators */}
            {blogs.length > 1 && (
              <div className="mt-5 flex items-center justify-center gap-1.5">
                {blogs.map((blog, index) => (
                  <button
                    key={blog.id}
                    type="button"
                    aria-label={`Go to article ${index + 1}`}
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