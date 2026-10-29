
"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Tag,
} from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

export interface FeaturedStoreItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  websiteUrl: string;
  affiliateUrl: string;
  category: string;
}

interface FeaturedStoresClientProps {
  stores: FeaturedStoreItem[];
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.215, 0.61, 0.355, 1],
      staggerChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function FeaturedStoresClient({
  stores,
}: FeaturedStoresClientProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const scrollStores = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left:
        (direction === "right" ? 1 : -1) *
        scrollRef.current.clientWidth *
        0.85,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  if (stores.length === 0) return null;

  return (
    <section
      aria-labelledby="featured-stores-heading"
      className="relative overflow-hidden bg-[var(--accent-light)] py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Section heading and navigation */}
          <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
            <motion.div variants={cardVariants} className="min-w-0">
              <h2
                id="featured-stores-heading"
                className="font-heading text-3xl font-black tracking-tight text-[var(--brand-purple)] sm:text-4xl lg:text-5xl"
              >
                FEATURED{" "}
                <span className="relative inline-block text-[var(--brand-yellow)]">
                  STORES
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-2 left-0 h-1.5 w-full rounded-full bg-[var(--brand-purple)]"
                  />
                </span>
              </h2>
            </motion.div>

            <motion.div
              variants={cardVariants}
              className="flex shrink-0 items-center gap-2 sm:gap-3"
            >
              <button
                type="button"
                onClick={() => scrollStores("left")}
                aria-label="Scroll stores left"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-white/80 text-[var(--brand-navy)] shadow-sm backdrop-blur-md transition hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)] active:scale-90 sm:h-11 sm:w-11"
              >
                <ArrowLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() => scrollStores("right")}
                aria-label="Scroll stores right"
                className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-md transition hover:opacity-95 active:scale-90 sm:h-11 sm:w-11"
                style={{ backgroundColor: "var(--brand-purple)" }}
              >
                <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>

          {/* Store carousel */}
          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth py-2 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
          >
            {stores.map((store) => (
              <motion.div
                key={store.id}
                variants={cardVariants}
                whileHover={prefersReducedMotion ? {} : { y: -6 }}
                transition={{ duration: 0.2 }}
                className="w-[72%] shrink-0 snap-start sm:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)]"
              >
                <div className="group relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-2xl border border-[var(--brand-yellow)] bg-[var(--brand-purple)]/75 p-4 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-yellow-900/5 sm:min-h-[240px]">
                  {/* Yellow corner decoration */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-0 z-0 h-24 w-24 rounded-br-xl opacity-85"
                    style={{ backgroundColor: "var(--brand-yellow)" }}
                  />

                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 z-10 h-1 opacity-40 transition-opacity group-hover:opacity-100"
                    style={{ backgroundColor: "var(--brand-yellow)" }}
                  />

                  {/* Logo and external store link */}
                  <div className="relative z-10 mb-2 flex items-start justify-between gap-2">
                    <Link
                      href={`/stores/${store.slug}`}
                      aria-label={`View ${store.name} coupons and deals`}
                      className="flex h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white p-2 shadow-inner sm:h-[72px] sm:w-[72px]"
                    >
                      {store.logo ? (
                        <img
                          src={store.logo}
                          alt={`${store.name} logo`}
                          loading="lazy"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span
                          className="text-2xl font-extrabold text-[var(--brand-purple)]"
                          aria-hidden="true"
                        >
                          {store.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </Link>

                    {store.affiliateUrl && (
                      <a
                        href={store.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        aria-label={`Visit ${store.name} through our affiliate link`}
                        title={`Visit ${store.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 transition hover:bg-[var(--brand-yellow)] hover:text-[var(--brand-navy)]"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>

                  {/* Store details */}
                  <Link
                    href={`/stores/${store.slug}`}
                    className="mt-4 block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-yellow)]"
                  >
                    <h3
                      className="font-heading text-lg font-bold tracking-tight text-[var(--brand-white)] sm:text-xl"
                    >
                      {store.name}
                    </h3>

                    <p className="mt-0.5 line-clamp-2 text-xs font-medium text-[var(--accent-light)] sm:text-sm">
                      {store.category}
                    </p>
                  </Link>

                  {/* Footer */}
                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <Link
                      href={`/stores/${store.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-yellow)] sm:text-sm"
                    >
                      <Tag size={14} className="shrink-0" />
                      Explore deals
                    </Link>

                    <Link
                      href={`/stores/${store.slug}`}
                      aria-label={`Explore ${store.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--brand-yellow)] transition group-hover:translate-x-0.5"
                    >
                      <ArrowUpRight size={17} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile scroll hint */}
          <div className="mt-2 flex items-center justify-between px-1 sm:hidden">
            <p className="text-xs font-medium text-[var(--muted)]">
              Swipe to explore stores
            </p>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-4 rounded-full bg-[var(--brand-purple)]" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
            </div>
          </div>

          {/* View all stores */}
          <motion.div
            variants={cardVariants}
            className="mt-8 flex justify-center sm:mt-10"
          >
            <Link
              href="/stores"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-6 py-3 text-sm font-bold text-[var(--brand-purple)] shadow-sm transition-all duration-200 hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)] active:scale-95"
            >
              Explore all stores
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
