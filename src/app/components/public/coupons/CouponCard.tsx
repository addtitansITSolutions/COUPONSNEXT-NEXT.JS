"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Star,
  TicketPercent,
  Tag,
  ShoppingBag,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
countries.registerLocale(enLocale);
export interface CouponItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: "code" | "deal";
  code: string;
  image: string;
  discount: string;
  affiliateUrl: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  country?: string;
  startsAt?: string | null;
  expiresAt?: string | null;
  category?: {
    name: string;
    slug: string;
  } | null;
  store: {
    name: string;
    slug: string;
    logo: string;
  };
}

interface CouponCardProps {
  coupon: CouponItem;
}

export default function CouponCard({ coupon }: CouponCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  const prefersReducedMotion = useReducedMotion();

  const isValidCountry = (country?: string) => {
  if (!country) return false;

  return Boolean(
    countries.alpha2ToAlpha3(country.toUpperCase())
  );
};

  // Sale countdown
  // useEffect(() => {
  //   if (!coupon.startsAt || !coupon.expiresAt) {
  //     setRemainingTime(null);
  //     return;
  //   }

  //   const startTime = new Date(coupon.startsAt).getTime();
  //   const endTime = new Date(coupon.expiresAt).getTime();

  //   if (
  //     !Number.isFinite(startTime) ||
  //     !Number.isFinite(endTime) ||
  //     startTime >= endTime
  //   ) {
  //     setRemainingTime(null);
  //     return;
  //   }

  //   const updateTimer = () => {
  //     const now = Date.now();

  //     if (now < startTime) {
  //       setRemainingTime(null);
  //       return;
  //     }

  //     setRemainingTime(Math.max(0, endTime - now));
  //   };

  //   updateTimer();

  //   const interval = setInterval(updateTimer, 1000);

  //   return () => clearInterval(interval);
  // }, [coupon.startsAt, coupon.expiresAt]);

  // Sale countdown
  useEffect(() => {
    setRemainingTime(null);

    if (!coupon.startsAt || !coupon.expiresAt) {
      return;
    }

    const startTime = new Date(coupon.startsAt).getTime();
    const endTime = new Date(coupon.expiresAt).getTime();

    if (
      !Number.isFinite(startTime) ||
      !Number.isFinite(endTime) ||
      startTime >= endTime
    ) {
      return;
    }

    const updateTimer = () => {
      const now = Date.now();

      // Sale has not started yet.
      if (now < startTime) {
        setRemainingTime(null);
        return;
      }

      // Sale has ended.
      if (now >= endTime) {
        setRemainingTime(0);
        return;
      }

      setRemainingTime(endTime - now);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [coupon.startsAt, coupon.expiresAt]);

  const formatRemainingTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  };

  const handleCouponClick = async () => {
    window.open(
      coupon.affiliateUrl,
      "_blank",
      "noopener,noreferrer"
    );

    if (coupon.type === "code" && coupon.code) {
      try {
        await navigator.clipboard.writeText(coupon.code);
        setIsCopied(true);
      } catch {
        // Continue navigation even if clipboard access fails.
      }
    }

    window.location.href = `/stores/${coupon.store.slug}`;
  };

  const imageSrc = coupon.image || coupon.store.logo;
  const hasValidCountry = isValidCountry(coupon.country);

  return (
    <motion.article
      whileHover={prefersReducedMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      {/* Coupon Image */}
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

        <div className="absolute left-0 top-0 flex items-stretch">
          {/* Text block */}
          <span className="bg-[var(--brand-purple)] px-2 pl-4 py-1.5 text-[8px] font-extrabold uppercase tracking-wide text-white">
            {coupon.type === "code" ? "Coupon Code" : "Deal"}
          </span>

          {/* Right S-curve */}
          <svg
            className="w-4 shrink-0 self-stretch"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 0 H100 C50 0, 95 100, 0 100 Z"
              fill="var(--brand-purple)"
            />
          </svg>
        </div>

        {/* Premium Verified Badge */}
        {coupon.isVerified && (
          <div className="absolute right-0 top-0 z-20 h-[100px] w-[100px] overflow-hidden">
            <div
              className="absolute inset-0 bg-[#111111]"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 100%)",
              }}
            />

            <div
              title="Verified Coupon"
              className="absolute -right-[35px] top-[20px] flex w-[135px] rotate-45 items-center justify-center gap-1 border-b border-[var(--brand-yellow)] bg-[#111111] py-2 text-[10px] font-extrabold tracking-widest text-[var(--brand-yellow)] shadow-lg"
            >
              <ShieldCheck size={13} strokeWidth={2.5} />
              VERIFIED
            </div>
          </div>
        )}
        {/* Discount */}
        {coupon.discount && (
          <div className="absolute bottom-0 right-0 flex max-w-full items-stretch">
            {/* Left S-curve */}
            <svg
              className="w-4 shrink-0 self-stretch"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 100 C 50 100, 5 0, 100 0 V 100 Z" fill="var(--brand-yellow)" />
            </svg>

            {/* Text block */}
            <span className="-ml-px min-w-0 truncate bg-[var(--brand-yellow)] py-1.5 pl-1 pr-3 text-[8px] font-black text-[var(--brand-navy)]">
              {coupon.discount}
            </span>
          </div>
        )}
      </div>

      {/* Coupon Highlights & Sale Countdown */}
      {(remainingTime !== null || coupon.isFeatured || coupon.country) && (
        <div className={`flex w-full border-b border-red-100 bg-white px-2 py-2 ${
            coupon.isFeatured
              ? "flex-col sm:flex-row sm:items-center sm:justify-between"
              : "flex-row items-center justify-between"
          }`}
        >

          {/* Countdown */}
          {remainingTime !== null && (
            <div className={`flex shrink-0 flex-col items-center justify-center sm:order-2 ${ !coupon.isFeatured && !hasValidCountry ? "mx-auto mx-0" : "" }`}>
              <span className="mb-1 text-[8px] font-extrabold uppercase tracking-widest text-green-600">
                {remainingTime === 0 ? "SALE IS LIVE" : "SALE ONGOING"}
              </span>

              <div className="flex items-center gap-1">
                {formatRemainingTime(remainingTime)
                  .split(":")
                  .map((digit, index) => (
                    <span
                      key={index}
                      className="min-w-[22px] rounded-md border border-red-200/60 bg-red-500/10 px-0.4 py-0.4 text-center font-mono text-[10px] font-black tracking-wider text-red-600"
                    >
                      {digit}
                    </span>
                  ))
                  .reduce<React.ReactNode[]>((items, item, index) => {
                    if (index > 0) {
                      items.push(
                        <span
                          key={`separator-${index}`}
                          className="text-xs font-black text-red-400"
                        >
                          :
                        </span>
                      );
                    }

                    items.push(item);
                    return items;
                  }, [])}
              </div>
            </div>
          )}

          {/* Featured Badge + Country Flag */}
          <div
            className={`flex min-w-0 items-center justify-between ${
              coupon.isFeatured
                ? "mt-2 w-full sm:mt-0 sm:w-auto sm:justify-start sm:gap-2 sm:order-1"
                : "w-auto gap-2"
            }`}
          >
            {coupon.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">
                <Star size={11} fill="currentColor" />
                Featured
              </span>
            )}

            {/* Show flag here only when Featured is available */}
            {remainingTime !== null && coupon.country && hasValidCountry && (
              <span
                title={coupon.country.toUpperCase()}
                className={`fi fi-${coupon.country.toLowerCase()}`}
              />
            )}

            {/* Show flag on right when timer is unavailable */}
            {remainingTime === null && coupon.country && hasValidCountry && (
              <span
                title={coupon.country.toUpperCase()}
                className={`fi fi-${coupon.country.toLowerCase()}`}
              />
            )}
          </div>
        </div>
      )}

      {/* Coupon Details */}
      <div className="flex flex-1 flex-col p-4">
        {/* Store & Category */}
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Link
            href={`/stores/${coupon.store.slug}`}
            className="inline-flex w-fit items-center gap-1.5 text-xs font-bold text-[var(--muted)] transition-colors hover:text-[var(--brand-purple)]"
          >
            {coupon.store.name}
            <ExternalLink size={12} />
          </Link>

          {coupon.category?.name && (
            <span className="truncate rounded-md bg-[var(--accent-light)] px-2 py-1 text-[10px] font-bold text-[var(--brand-purple)]">
              {coupon.category.name}
            </span>
          )}
        </div>

        {/* Coupon Title */}
        <h3 className="line-clamp-2 min-h-6 text-sm font-bold leading-6 text-[var(--brand-navy)] transition-colors group-hover:text-[var(--brand-purple)] sm:text-base">
          {coupon.title}
        </h3>

        {/* Description */}
        {coupon.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
            {coupon.description}
          </p>
        )}

        {/* Coupon Action */}
        <div className="mt-auto pt-5">
          {/* {coupon.type === "code" && coupon.code && (
            <div className="mb-3 flex items-center justify-between gap-2 rounded-lg border border-dashed border-[var(--brand-purple)]/40 bg-[var(--accent-light)] px-3 py-2">
              <span className="truncate text-xs font-extrabold tracking-wider text-[var(--brand-purple)]">
                {coupon.code}
              </span>

              <Tag
                size={15}
                className="shrink-0 text-[var(--brand-purple)]"
              />
            </div>
          )} */}
          {coupon.type === "code" && coupon.code ? (
            <div className="mb-3 flex items-center justify-between gap-2 rounded-lg border border-dashed border-[var(--brand-purple)]/40 bg-[var(--accent-light)] px-3 py-2">
              <span className="truncate text-xs font-extrabold tracking-wider text-[var(--brand-purple)]">
                {coupon.code}
              </span>

              <Tag
                size={15}
                className="shrink-0 text-[var(--brand-purple)]"
              />
            </div>
          ) : (
            <div className="mb-3 flex items-center justify-between gap-2 rounded-lg border border-dashed border-[var(--brand-purple)]/40 bg-[var(--accent-light)] px-3 py-2">
              <span className="text-xs font-bold text-[var(--brand-purple)]">
                Exclusive Deal
              </span>

              <ShoppingBag
                size={15}
                className="shrink-0 text-[var(--brand-purple)]"
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => void handleCouponClick()}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-purple)] px-2 py-3 text-xs font-bold text-white transition-colors hover:bg-[var(--accent-hover)] active:scale-[0.98]"
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
}

