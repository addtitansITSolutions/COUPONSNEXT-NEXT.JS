"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import CouponCard from "@/components/public/coupons/CouponCard";
import type { CouponItem } from "@/components/public/coupons/CouponCard";

interface CouponRelatedProps {
  coupons: CouponItem[];
  storeSlug?: string;
}

export default function CouponRelated({
  coupons,
  storeSlug,
}: CouponRelatedProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentIndex = useRef(0);
  const isPaused = useRef(false);
  const isResetting = useRef(false);

  const carouselCoupons = [...coupons, ...coupons];

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
    const count = coupons.length;

    if (count <= 1 || isResetting.current) return;

    const nextIndex = currentIndex.current + 1;

    if (nextIndex >= count) {
      isResetting.current = true;

      // Move to the duplicated first card.
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
  }, [coupons.length, scrollToIndex]);

  const previousSlide = useCallback(() => {
    const count = coupons.length;

    if (count <= 1 || isResetting.current) return;

    const previousIndex = currentIndex.current - 1;

    if (previousIndex < 0) {
      isResetting.current = true;

      // Move to the duplicated last card.
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
  }, [coupons.length, scrollToIndex]);

  // Autoplay
  useEffect(() => {
    if (coupons.length <= 1) return;

    const interval = window.setInterval(() => {
      if (!isPaused.current) {
        nextSlide();
      }
    }, 3500);

    return () => window.clearInterval(interval);
  }, [coupons.length, nextSlide]);

  // Track manually scrolled position.
  const handleScroll = useCallback(() => {
    const carousel = carouselRef.current;

    if (!carousel || isResetting.current) return;

    const cards = cardRefs.current.slice(0, coupons.length);

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
  }, [coupons.length]);

  if (!coupons.length) return null;

  return (
    <section className="relative overflow-hidden border-t border-[var(--border)] bg-white py-14 sm:py-16 lg:py-20">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-40 top-0 size-96 rounded-full bg-[var(--accent-light)] opacity-40 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:mb-10 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--brand-purple)]/10 bg-[var(--accent-light)] px-3.5 py-2 text-xs font-bold text-[var(--brand-purple)]">
              <Sparkles size={14} />
              More Ways to Save
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--brand-navy)] sm:text-3xl lg:text-4xl">
              Related Coupons & Deals
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              Explore more exclusive offers and discounts selected to help
              you save on your next purchase.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 sm:justify-end">
            {storeSlug && (
              <Link
                href={`/stores/${storeSlug}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-purple)] transition-colors hover:text-[var(--accent-hover)]"
              >
                View all offers
                <ArrowRight size={16} />
              </Link>
            )}

            {/* Navigation */}
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={previousSlide}
                disabled={coupons.length <= 1}
                aria-label="Previous coupon"
                className="flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--brand-navy)] shadow-sm transition-all hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={18} />
              </button>

              <button
                type="button"
                onClick={nextSlide}
                disabled={coupons.length <= 1}
                aria-label="Next coupon"
                className="flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--brand-navy)] shadow-sm transition-all hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Coupon carousel */}
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
          className="flex items-stretch gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-6"
        >
          {carouselCoupons.map((coupon, index) => (
            <div
              key={`${coupon.id}-${index}`}
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
              className="flex h-auto min-w-0 shrink-0 snap-start basis-[calc((100%-20px)/2)] md:basis-[calc((100%-48px)/3)] lg:basis-[calc((100%-72px)/4)]"
            >
              <div className="flex h-full w-full min-w-0 [&>article]:h-full [&>article]:w-full">
                <CouponCard coupon={coupon} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
