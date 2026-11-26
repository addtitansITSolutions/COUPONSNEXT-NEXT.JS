
"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import BlogCard from "@/components/public/blogs/BlogCard";
import { motion } from "framer-motion";

export interface FeaturedBlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  author: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  isFeatured: boolean;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
}

interface FeaturedBlogsClientProps {
  blogs: FeaturedBlogItem[];
}

export default function FeaturedBlogsClient({
  blogs,
}: FeaturedBlogsClientProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentIndex = useRef(0);
  const isPaused = useRef(false);
  const isResetting = useRef(false);

  const carouselBlogs = [...blogs, ...blogs];

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
    const count = blogs.length;

    if (count <= 1 || isResetting.current) return;

    const nextIndex = currentIndex.current + 1;

    if (nextIndex >= count) {
      isResetting.current = true;

      scrollToIndex(count, false);

      requestAnimationFrame(() => {
        currentIndex.current = 1;
        scrollToIndex(count + 1);

        window.setTimeout(() => {
          isResetting.current = false;
        }, 500);
      });

      return;
    }

    currentIndex.current = nextIndex;
    scrollToIndex(nextIndex);
  }, [blogs.length, scrollToIndex]);

  const previousSlide = useCallback(() => {
    const count = blogs.length;

    if (count <= 1 || isResetting.current) return;

    const previousIndex = currentIndex.current - 1;

    if (previousIndex < 0) {
      isResetting.current = true;

      scrollToIndex(count * 2 - 1, false);

      requestAnimationFrame(() => {
        currentIndex.current = count - 1;
        scrollToIndex(count * 2 - 2);

        window.setTimeout(() => {
          isResetting.current = false;
        }, 500);
      });

      return;
    }

    currentIndex.current = previousIndex;
    scrollToIndex(previousIndex);
  }, [blogs.length, scrollToIndex]);

  // Autoplay
  useEffect(() => {
    if (blogs.length <= 1) return;

    const interval = window.setInterval(() => {
      if (!isPaused.current) {
        nextSlide();
      }
    }, 3500);

    return () => window.clearInterval(interval);
  }, [blogs.length, nextSlide]);

  // Track manually scrolled position.
  const handleScroll = useCallback(() => {
    const carousel = carouselRef.current;

    if (!carousel || isResetting.current) return;

    const cards = cardRefs.current.slice(0, blogs.length);

    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
      if (!card) return;

      const distance = Math.abs(
        card.offsetLeft - carousel.offsetLeft - carousel.scrollLeft
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    currentIndex.current = closestIndex;
  }, [blogs.length]);

  if (blogs.length === 0) return null;

  return (
    <section className="relative overflow-hidden border-t border-[var(--border)] bg-white py-14 sm:py-16 lg:py-20">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-40 top-0 size-96 rounded-full bg-[var(--accent-light)] opacity-40 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:mb-10 sm:flex-row sm:items-end">
          <motion.div className="min-w-0">
              <h2
                id="featured-stores-heading"
                className="relative font-heading text-sm font-black tracking-tight text-[var(--brand-purple)] sm:text-sm lg:text-xl"
              >
                ESSENTIAL{" "}
                <span className="relative inline-block text-[var(--brand-yellow)]">
                  READS
                </span>
                <span
                    aria-hidden="true"
                    className="absolute -bottom-2 left-0 h-1 w-full rounded-full bg-[var(--brand-purple)]"
                  />
              </h2>
            </motion.div>

          <div className="flex items-center justify-between gap-4 sm:justify-end">

            {/* View all */}
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-purple)] transition-colors hover:text-[var(--accent-hover)]"
            >
              View all articles
              <ArrowRight size={16} />
            </Link>

            {/* Navigation */}
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={previousSlide}
                disabled={blogs.length <= 1}
                aria-label="Previous article"
                className="flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--brand-navy)] shadow-sm transition-all hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={18} />
              </button>

              <button
                type="button"
                onClick={nextSlide}
                disabled={blogs.length <= 1}
                aria-label="Next article"
                className="flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--brand-navy)] shadow-sm transition-all hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Blog carousel */}
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
          className="flex items-stretch gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-6"
        >
          {carouselBlogs.map((blog, index) => (
            <div
              key={`${blog.id}-${index}`}
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
              aria-hidden={index >= blogs.length}
              className="flex h-auto min-w-0 shrink-0 snap-start basis-[calc((100%-16px)/1)] sm:basis-[calc((100%-16px)/2)] md:basis-[calc((100%-48px)/3)] lg:basis-[calc((100%-72px)/4)]"
            >
              <div className="flex h-full w-full min-w-0 [&>article]:h-full [&>article]:w-full">
                <BlogCard blog={blog} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}