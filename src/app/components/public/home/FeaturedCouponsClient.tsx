"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  TicketPercent,
  Tag,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export interface FeaturedCouponItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: "code" | "deal";
  code: string;
  image: string;
  discount: string;
  affiliateUrl: string;
  store: {
    name: string;
    slug: string;
    logo: string;
  };
}

interface FeaturedCouponsClientProps {
  coupons: FeaturedCouponItem[];
}

export default function FeaturedCouponsClient({
  coupons,
}: FeaturedCouponsClientProps) {
  const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleCouponClick = async (coupon: FeaturedCouponItem) => {
    // Open the affiliate link immediately from the user's click.
    const affiliateTab = window.open(
      coupon.affiliateUrl,
      "_blank",
      "noopener,noreferrer"
    );

    if (coupon.type === "code" && coupon.code) {
      try {
        await navigator.clipboard.writeText(coupon.code);
        setCopiedCouponId(coupon.id);
      } catch {
        // The affiliate link still opens if clipboard access is unavailable.
      }
    }

    // Keep the affiliate destination in a new tab and the store page here.
    window.location.href = `/${coupon.store.slug}`;
  };

  if (coupons.length === 0) return null;

  return (
    <section
      aria-labelledby="featured-coupons-heading"
      className="relative overflow-hidden bg-white py-8 sm:py-10 lg:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--brand-purple)] sm:text-sm">
              Save more on every order
            </p>
          </div>

          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-light)] text-[var(--brand-purple)] sm:flex">
            <TicketPercent size={25} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {coupons.map((coupon) => {
            const isCopied = copiedCouponId === coupon.id;
            const imageSrc = coupon.image || coupon.store.logo;

            return (
              <motion.article
                key={coupon.id}
                whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                transition={{ duration: 0.2 }}
                className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="relative flex h-40 items-center justify-center overflow-hidden bg-slate-50 p-5">
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1 bg-[var(--brand-yellow)] transition-colors group-hover:bg-[var(--brand-purple)]"
                  />

                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={`${coupon.store.name} offer`}
                      width={180}
                      height={120}
                      unoptimized
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--accent-light)] text-[var(--brand-purple)]">
                      <TicketPercent size={36} />
                    </div>
                  )}

                  <span className="absolute left-3 top-4 rounded-full bg-[var(--brand-purple)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
                    {coupon.type === "code" ? "Coupon Code" : "Deal"}
                  </span>

                  {coupon.discount && (
                    <span className="absolute bottom-3 right-3 rounded-lg bg-[var(--brand-yellow)] px-3 py-1.5 text-xs font-black text-[var(--brand-navy)]">
                      {coupon.discount}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <Link
                    href={`/${coupon.store.slug}`}
                    className="mb-2 inline-flex w-fit items-center gap-1.5 text-xs font-bold text-[var(--muted)] transition-colors hover:text-[var(--brand-purple)]"
                  >
                    {coupon.store.name}
                    <ExternalLink size={12} />
                  </Link>

                  <h3 className="line-clamp-2 min-h-12 text-sm font-bold leading-6 text-[var(--brand-navy)] transition-colors group-hover:text-[var(--brand-purple)] sm:text-base">
                    {coupon.title}
                  </h3>

                  {coupon.description && (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
                      {coupon.description}
                    </p>
                  )}

                  <div className="mt-auto pt-5">
                    {coupon.type === "code" && coupon.code && (
                      <div className="mb-3 flex items-center justify-between gap-2 rounded-lg border border-dashed border-[var(--brand-purple)]/40 bg-[var(--accent-light)] px-3 py-2">
                        <span className="truncate text-xs font-extrabold tracking-wider text-[var(--brand-purple)]">
                          {coupon.code}
                        </span>
                        <Tag size={15} className="shrink-0 text-[var(--brand-purple)]" />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => void handleCouponClick(coupon)}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-purple)] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-hover)] active:scale-[0.98]"
                    >
                      {coupon.type === "code" ? (
                        isCopied ? (
                          <>
                            <Check size={16} />
                            Code Copied
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            Copy Code
                          </>
                        )
                      ) : (
                        <>
                          Get Deal
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-7 flex justify-center sm:mt-9">
          <Link
            href="/coupons"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-6 py-3 text-sm font-bold text-[var(--brand-purple)] shadow-sm transition-colors hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)] active:scale-95"
          >
            View All Coupons
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}