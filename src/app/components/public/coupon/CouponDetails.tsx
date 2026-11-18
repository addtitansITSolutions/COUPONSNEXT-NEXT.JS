"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  TicketPercent,
  Timer,
} from "lucide-react";

import type { CouponItem } from "@/components/public/coupons/CouponCard";

interface CouponDetailsProps {
  coupon: CouponItem;
}

function formatRemainingTime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export default function CouponDetails({ coupon }: CouponDetailsProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  // null = no sale window / not started, 0 = ended, > 0 = ms remaining
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  const isCode = coupon.type === "code";
  const imageSrc = coupon.image || coupon.store.logo;

  // Sale countdown
  useEffect(() => {
    setRemainingTime(null);

    if (!coupon.startsAt || !coupon.expiresAt) return;

    const startTime = new Date(coupon.startsAt).getTime();
    const endTime = new Date(coupon.expiresAt).getTime();

    if (
      !Number.isFinite(startTime) ||
      !Number.isFinite(endTime) ||
      startTime >= endTime
    ) {
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;

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
        if (interval) clearInterval(interval);
        return;
      }

      setRemainingTime(endTime - now);
    };

    updateTimer();
    interval = setInterval(updateTimer, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [coupon.startsAt, coupon.expiresAt]);

  const handleCopyCode = async () => {
    if (!coupon.code) return;

    setCopyFailed(false);

    try {
      await navigator.clipboard.writeText(coupon.code);
      setIsCopied(true);

      window.setTimeout(() => {
        setIsCopied(false);
      }, 2500);
    } catch {
      setCopyFailed(true);
    }
  };

  const handleOfferClick = async () => {
    window.open(coupon.affiliateUrl, "_blank", "noopener,noreferrer");

    if (isCode && coupon.code) {
      await handleCopyCode();
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-white py-8 sm:py-12">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-48 -top-32 h-[480px] w-[480px] rounded-full bg-[var(--accent-light)] opacity-50 blur-[100px]" />
      <div className="pointer-events-none absolute -left-48 top-[40%] h-[350px] w-[350px] rounded-full bg-purple-50 opacity-60 blur-[100px]" />

      <div className="relative mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* ===================================== */}
        {/* OFFER CARD */}
        {/* ===================================== */}

        <div className="mx-auto w-full max-w-xl">
          <div className="group relative">
            {/* Card glow */}
            <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-br from-[var(--brand-purple)]/15 via-transparent to-[var(--brand-yellow)]/20 opacity-70 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

            <aside className="relative overflow-hidden rounded-[26px] ">
              {/* Top accent */}
              {/* <div className="h-1.5 w-full bg-gradient-to-r from-[var(--brand-purple)] via-purple-400 to-[var(--brand-yellow)]" /> */}

              {/* Offer image */}
              <div className="relative flex h-56 items-center justify-center overflow-hidden  p-8 sm:h-64 sm:p-10">
                <div className="pointer-events-none absolute -right-12 -top-16 size-56 rounded-full border border-purple-100/70" />
                <div className="pointer-events-none absolute -bottom-24 -left-16 size-56 rounded-full bg-purple-100/30 blur-3xl" />

                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={`${coupon.store.name} offer`}
                    width={420}
                    height={260}
                    unoptimized
                    priority
                    className="relative z-10 h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="relative z-10 flex size-28 items-center justify-center rounded-3xl bg-[var(--accent-light)]">
                    <TicketPercent
                      size={54}
                      strokeWidth={1.5}
                      className="text-[var(--brand-purple)]"
                    />
                  </div>
                )}

                {/* Discount badge */}
                {coupon.discount && (
                  <div className="absolute bottom-5 right-5 z-20 inline-flex items-center gap-1.5 rounded-xl border border-amber-200/80 bg-[var(--brand-yellow)] px-4 py-2.5 shadow-lg shadow-amber-900/10">
                    <Tag size={14} className="text-[var(--brand-navy)]" />
                    <span className="text-sm font-extrabold tracking-tight text-[var(--brand-navy)]">
                      {coupon.discount}
                    </span>
                  </div>
                )}
              </div>

              {/* Sale countdown */}
              {remainingTime !== null && (
                <div className="flex items-center justify-between gap-3 border-y border-red-100 bg-red-50/50 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Timer
                      size={16}
                      className={
                        remainingTime === 0 ? "text-slate-400" : "text-red-500"
                      }
                    />
                    <span
                      className={`text-[11px] font-extrabold uppercase tracking-widest ${
                        remainingTime === 0 ? "text-slate-500" : "text-green-600"
                      }`}
                    >
                      {remainingTime === 0 ? "Sale is live" : "Sale ends in"}
                    </span>
                  </div>

                  {remainingTime > 0 && (
                    <div className="flex items-center gap-1">
                      {formatRemainingTime(remainingTime)
                        .split(":")
                        .map((digit, index) => (
                          <div key={index} className="flex items-center gap-1">
                            {index > 0 && (
                              <span className="text-sm font-black text-red-400">
                                :
                              </span>
                            )}
                            <span className="min-w-[32px] rounded-md border border-red-200/60 bg-red-500/10 px-1.5 py-1 text-center font-mono text-sm font-black tracking-wider text-red-600">
                              {digit}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Card content */}
              <div className="space-y-4 p-5 sm:p-7">
                {/* Coupon code / no code */}
                {isCode && coupon.code ? (
                  <div className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-dashed border-[var(--brand-purple)]/40 bg-gradient-to-r from-[var(--accent-light)] to-purple-50/50 px-4 py-2">
                    <span className="min-w-0 break-all font-mono text-lg font-extrabold tracking-[0.12em] text-[var(--brand-purple)] sm:text-xl">
                      {coupon.code}
                    </span>

                    <button
                      type="button"
                      onClick={() => void handleCopyCode()}
                      aria-label="Copy coupon code"
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                        isCopied
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                          : "bg-white text-[var(--brand-purple)] shadow-sm hover:bg-[var(--brand-purple)] hover:text-white hover:shadow-lg"
                      }`}
                    >
                      {isCopied ? (
                        <Check size={18} strokeWidth={2.5} />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex min-h-14 items-center justify-center gap-2.5 rounded-2xl border border-dashed border-[var(--brand-purple)]/30 bg-gradient-to-r from-[var(--accent-light)] to-purple-50/50 px-4 py-3">
                    <ShoppingBag
                      size={18}
                      className="text-[var(--brand-purple)]"
                    />
                    <p className="text-sm font-extrabold text-[var(--brand-navy)]">
                      No code required
                    </p>
                  </div>
                )}

                {/* Main CTA */}
                <button
                  type="button"
                  onClick={() => void handleOfferClick()}
                  className="group/button flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[var(--brand-purple)] to-[var(--accent-hover)] px-5 py-4 text-sm font-extrabold text-white shadow-[0_10px_25px_rgba(124,58,237,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(124,58,237,0.3)] active:translate-y-0"
                >
                  {isCode ? (
                    isCopied ? (
                      <>
                        <Check size={19} />
                        Code Copied — Visit Store
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        Copy Code & Get Offer
                      </>
                    )
                  ) : (
                    <>
                      Get This Deal
                      <ArrowUpRight
                        size={19}
                        className="transition-transform duration-200 group-hover/button:-translate-y-0.5 group-hover/button:translate-x-0.5"
                      />
                    </>
                  )}
                </button>

                {/* Copy feedback */}
                {copyFailed && isCode && (
                  <p
                    role="alert"
                    className="text-center text-xs font-medium text-red-600"
                  >
                    We couldn&apos;t copy automatically. Please copy the code
                    above.
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>

        {/* ===================================== */}
        {/* COUPON CONTENT */}
        {/* ===================================== */}

        <div className="mt-12 sm:mt-16">
          {/* Status badges */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-purple)]/10 bg-[var(--accent-light)] px-3.5 py-2 text-xs font-bold text-[var(--brand-purple)]">
              {isCode ? <TicketPercent size={14} /> : <ShoppingBag size={14} />}
              {isCode ? "Coupon Code" : "Exclusive Deal"}
            </span>

            {coupon.isVerified && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700">
                <ShieldCheck size={14} />
                Verified Offer
              </span>
            )}

            {coupon.isFeatured && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800">
                <Sparkles size={14} />
                Featured Offer
              </span>
            )}
          </div>

          <h1 className="max-w-4xl text-3xl font-extrabold leading-[1.15] tracking-tight text-[var(--brand-navy)] sm:text-4xl lg:text-[46px]">
            {coupon.title}
          </h1>

          {coupon.description && (
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-[17px]">
              {coupon.description}
            </p>
          )}

          {coupon.discount && (
            <div className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-3.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--brand-yellow)] text-[var(--brand-navy)] shadow-sm">
                <Tag size={19} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
                  Available Discount
                </p>
                <p className="mt-0.5 text-lg font-extrabold tracking-tight text-[var(--brand-navy)]">
                  {coupon.discount}
                </p>
              </div>
            </div>
          )}

          <div className="mt-10 border-t border-slate-200 pt-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={`/stores/${coupon.store.slug}`}
                className="group/store flex w-fit items-center gap-3.5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition-colors group-hover/store:border-[var(--brand-purple)]/30">
                  {coupon.store.logo ? (
                    <Image
                      src={coupon.store.logo}
                      alt={`${coupon.store.name} logo`}
                      fill
                      unoptimized
                      sizes="56px"
                      className="object-contain p-2"
                    />
                  ) : (
                    <ShoppingBag
                      size={24}
                      className="text-[var(--brand-purple)]"
                    />
                  )}
                </div>

                <div>
                  <span className="block text-xs font-medium text-[var(--muted)]">
                    Exclusive offer from
                  </span>

                  <span className="mt-1 flex items-center gap-1.5 text-sm font-extrabold text-[var(--brand-navy)] transition-colors group-hover/store:text-[var(--brand-purple)]">
                    {coupon.store.name}
                    <ExternalLink size={13} className="text-[var(--muted)]" />
                  </span>
                </div>
              </Link>

              {coupon.category && (
                <Link
                  href={`/categories/${coupon.category.slug}`}
                  className="inline-flex w-fit items-center gap-2 rounded-xl border border-[var(--brand-purple)]/15 bg-[var(--accent-light)] px-4 py-3 text-xs font-bold text-[var(--brand-purple)] transition-all duration-200 hover:border-[var(--brand-purple)] hover:bg-[var(--brand-purple)] hover:text-white"
                >
                  <Tag size={14} />
                  {coupon.category.name}
                  <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}