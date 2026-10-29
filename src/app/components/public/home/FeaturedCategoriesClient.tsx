"use client";
import { useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export interface FeaturedCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  contentTypes: string[];
}

interface FeaturedCategoriesClientProps {
  categories: FeaturedCategoryItem[];
}

export default function FeaturedCategoriesClient({
  categories,
}: FeaturedCategoriesClientProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const scrollCategories = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left:
        (direction === "right" ? 1 : -1) *
        scrollRef.current.clientWidth *
        0.85,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  if (categories.length === 0) return null;

  return (
    <section
      aria-labelledby="featured-categories-heading"
      className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading and navigation */}
        <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <h2
            id="featured-categories-heading"
            className="font-heading text-3xl font-black tracking-tight text-[var(--brand-purple)] sm:text-4xl lg:text-5xl"
          >
            FEATURED{" "}
            <span className="relative inline-block text-[var(--brand-yellow)]">
              CATEGORIES
              <span
                aria-hidden="true"
                className="absolute -bottom-2 left-0 h-1.5 w-full rounded-full bg-[var(--brand-purple)]"
              />
            </span>
          </h2>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => scrollCategories("left")}
              aria-label="Scroll categories left"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-white text-[var(--brand-navy)] shadow-sm transition hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)] active:scale-90 sm:h-11 sm:w-11"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => scrollCategories("right")}
              aria-label="Scroll categories right"
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-md transition hover:opacity-95 active:scale-90 sm:h-11 sm:w-11"
              style={{ backgroundColor: "var(--brand-purple)" }}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
        
        {/* Category carousel */}
        <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth py-4 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-8 lg:gap-10"
        >
        {categories.map((category) => (
            <motion.div
            key={category.id}
            whileHover={prefersReducedMotion ? {} : { y: -5 }}
            transition={{ duration: 0.2 }}
            className="w-[120px] shrink-0 snap-start sm:w-[150px] lg:w-[170px]"
            >
            <Link
                href={`/categories/${category.slug}`}
                className="group flex flex-col items-center text-center"
            >
                {/* Circular category image */}
                <div className="relative mb-4 aspect-square w-full rounded-full p-1">
                {/* Brand ring */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full border-[3px] border-[var(--brand-yellow)] transition-colors duration-300 group-hover:border-[var(--brand-purple)]"
                />

                {/* Image container */}
                <div className="absolute inset-[7px] overflow-hidden rounded-full bg-[var(--accent-light)]">
                    {category.image ? (
                    <img
                        src={category.image}
                        alt={`${category.name} category`}
                        loading="lazy"
                        className="h-full w-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--brand-purple)]/10">
                        <span
                        aria-hidden="true"
                        className="text-4xl font-black text-[var(--brand-purple)] sm:text-5xl"
                        >
                        {category.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    )}
                </div>
                </div>

                {/* Category name */}
                <h3 className="font-heading line-clamp-2 text-sm font-bold text-[var(--brand-navy)] transition-colors group-hover:text-[var(--brand-purple)] sm:text-base">
                {category.name}
                </h3>

                {/* Optional description */}
                {category.description && (
                <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">
                    {category.description}
                </p>
                )}
            </Link>
            </motion.div>
        ))}
        </div>

      </div>
    </section>
  );
}