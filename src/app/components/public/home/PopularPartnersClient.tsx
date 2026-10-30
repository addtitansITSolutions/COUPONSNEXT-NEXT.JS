"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  TicketPercent,
  Tag,
  ArrowUpRight,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

export interface PopularCouponItem {
  id: string;
  title: string;
  slug: string;
  type: "code" | "deal";
  code: string;
  image: string;
  discount: string;
  store: {
    name: string;
    slug: string;
    logo: string;
  };
}

interface PopularPartnersClientProps {
  coupons: PopularCouponItem[];
}

const VISIBLE_COUPON_COUNT = 5;
const ROTATION_INTERVAL = 1000;

export default function PopularPartnersClient({
  coupons,
}: PopularPartnersClientProps) {
  const [currentStartIndex, setCurrentStartIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (coupons.length <= VISIBLE_COUPON_COUNT) return;

    const interval = window.setInterval(() => {
      setCurrentStartIndex((previous) => (previous + 1) % coupons.length);
    }, ROTATION_INTERVAL);

    return () => window.clearInterval(interval);
  }, [coupons.length]);

  if (coupons.length === 0) return null;

  // Get five coupons at a time and loop back to the beginning.
  const visibleCoupons = Array.from(
    { length: Math.min(VISIBLE_COUPON_COUNT, coupons.length) },
    (_, index) => coupons[(currentStartIndex + index) % coupons.length]
  );

  return (
    <aside
      aria-labelledby="verified-coupons-heading"
      className="hidden h-full w-[260px] shrink-0 lg:block xl:w-[280px]"
    >
      <div className="h-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--accent-light)] shadow-sm">
        {/* Header */}
        <div className="border-b border-[var(--border)] px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-[var(--brand-purple)]" />

                <h2
                  id="verified-coupons-heading"
                  className="font-heading text-base font-extrabold text-[var(--brand-navy)]"
                >
                  Popular Coupons
                </h2>
              </div>

              {/* <p className="mt-1 pl-3 text-xs text-[var(--muted)]">
                Trusted offers, verified for you
              </p> */}
            </div>

            <Link
              href="/coupons"
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-light)] px-3 text-xs font-bold text-[var(--brand-purple)] transition-colors hover:bg-[var(--brand-purple)] hover:text-white"
            >
              View All
            </Link>
          </div>
        </div>

        {/* Auto-Rotating Coupons */}
        <div className="space-y-2 overflow-hidden p-3">
          <AnimatePresence initial={false} mode="popLayout">
            {visibleCoupons.map((coupon, index) => {
              const imageSrc = coupon.image || coupon.store.logo;

              return (
                <motion.div
                  key={coupon.id}
                  layout
                  initial={
                    prefersReducedMotion
                      ? false
                      : { opacity: 0, y: 20 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: -20 }
                  }
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.3,
                    ease: "easeInOut",
                    layout: {
                      duration: prefersReducedMotion ? 0 : 0.3,
                    },
                  }}
                >
                  <Link
                    href={`/coupons/${coupon.slug}`}
                    title={coupon.title}
                    className="group flex items-center gap-3 rounded-xl border border-transparent p-2.5 transition-all duration-200 hover:border-[var(--brand-purple)]/15 hover:bg-[var(--accent-light)]"
                  >
                    {/* Coupon Image / Store Logo / Initial */}
                    <div className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center overflow-visible rounded-xl border border-[var(--border)] bg-white p-1.5">
                      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-[var(--accent-light)]">
                        {imageSrc ? (
                          <Image
                            src={imageSrc}
                            alt={`${coupon.store.name} offer`}
                            width={58}
                            height={58}
                            unoptimized
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-2xl font-black text-[var(--brand-purple)]">
                            {coupon.store.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Verified Badge */}
                      <span
                        title="Verified coupon"
                        aria-label="Verified coupon"
                        className="absolute -right-1.5 -top-1.5 flex h-[19px] w-[19px] items-center justify-center rounded-full border-2 border-white bg-[var(--brand-purple)] text-white"
                      >
                        <BadgeCheck size={13} strokeWidth={2.8} />
                      </span>
                    </div>

                    {/* Coupon Details */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-1">
                        <p className="truncate text-[10px] font-bold uppercase tracking-wide text-[var(--brand-purple)]">
                          {coupon.store.name}
                        </p>
                      </div>

                      <h3 className="line-clamp-1 text-xs font-bold leading-[1.4] text-[var(--brand-navy)] transition-colors group-hover:text-[var(--brand-purple)]">
                        {coupon.title}
                      </h3>

                      <div className="mt-1.5 flex items-center justify-between gap-1">
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
                          <span className="max-w-[90px] truncate rounded-md bg-[var(--brand-yellow)] px-1.5 py-0.5 text-[10px] font-extrabold text-[var(--brand-navy)]">
                            {coupon.discount}
                          </span>
                        )}
                      </div>
                    </div>

                    <ArrowUpRight
                      size={15}
                      className="shrink-0 text-[var(--muted)] transition-colors group-hover:text-[var(--brand-purple)]"
                    />
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}