"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  TicketPercent,
  Tag,
  ArrowUpRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

import type { PopularCouponItem } from "./PopularPartnersClient";

interface PopularPartnersMobileClientProps {
  coupons: PopularCouponItem[];
}

export default function PopularPartnersMobileClient({
  coupons,
}: PopularPartnersMobileClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (coupons.length <= 1) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((previous) => (previous + 1) % coupons.length);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [coupons.length]);

  if (coupons.length === 0) return null;

  return (
    <section
      aria-labelledby="mobile-popular-coupons-heading"
      className="w-full overflow-hidden lg:hidden py-5 sm:py-6 lg:py-10 max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2
            id="mobile-popular-coupons-heading"
            className="font-heading text-base font-extrabold text-[var(--brand-navy)]"
          >
            Popular Coupons
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Trusted offers, verified for you
          </p>
        </div>

        <Link
          href="/coupons"
          className="shrink-0 text-xs font-bold text-[var(--brand-purple)] hover:underline"
        >
          View All →
        </Link>
      </div>

      <div className="relative overflow-hidden">
        <div className="flex gap-3">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={coupons[currentIndex].id}
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, x: 35 }
              }
              animate={{ opacity: 1, x: 0 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: -35 }
              }
              transition={{
                duration: prefersReducedMotion ? 0 : 0.3,
              }}
              className="w-full min-w-0"
            >
              {(() => {
                const coupon = coupons[currentIndex];
                const imageSrc = coupon.image || coupon.store.logo;

                return (
                  <Link
                    href={`/coupons/${coupon.slug}`}
                    title={coupon.title}
                    className="group flex min-w-0 items-center gap-3 rounded-xl border border-[var(--border)] bg-white p-3 shadow-sm transition-colors hover:border-[var(--brand-purple)]/30"
                  >
                    <div className="relative flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-white p-1.5">
                      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-[var(--accent-light)]">
                        {imageSrc ? (
                          <Image
                            src={imageSrc}
                            alt={`${coupon.store.name} offer`}
                            width={66}
                            height={66}
                            unoptimized
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-2xl font-black text-[var(--brand-purple)]">
                            {coupon.store.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <span
                        title="Verified coupon"
                        aria-label="Verified coupon"
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[var(--brand-purple)] text-white"
                      >
                        <BadgeCheck size={13} strokeWidth={2.8} />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-bold uppercase tracking-wide text-[var(--brand-purple)]">
                        {coupon.store.name}
                      </p>

                      <h3 className="mt-1 line-clamp-1 text-sm font-bold leading-5 text-[var(--brand-navy)] group-hover:text-[var(--brand-purple)]">
                        {coupon.title}
                      </h3>

                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--muted)]">
                          {coupon.type === "code" ? (
                            <>
                              <TicketPercent size={11} />
                              Code
                            </>
                          ) : (
                            <>
                              <Tag size={11} />
                              Deal
                            </>
                          )}
                        </span>

                        {coupon.discount && (
                          <span className="max-w-[100px] truncate rounded-md bg-[var(--brand-yellow)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--brand-navy)]">
                            {coupon.discount}
                          </span>
                        )}
                      </div>
                    </div>

                    <ArrowUpRight
                      size={17}
                      className="shrink-0 text-[var(--muted)] group-hover:text-[var(--brand-purple)]"
                    />
                  </Link>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}