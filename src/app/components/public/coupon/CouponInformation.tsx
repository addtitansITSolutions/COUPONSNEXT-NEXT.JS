
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  ShieldCheck,
  Tag,
  TicketPercent,
} from "lucide-react";

import type { CouponItem } from "@/components/public/coupons/CouponCard";

interface CouponInformationProps {
  coupon: CouponItem;
}

function formatDate(date?: string | null) {
  if (!date) return null;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return null;

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

export default function CouponInformation({
  coupon,
}: CouponInformationProps) {
  const startDate = formatDate(coupon.startsAt);
  const expiryDate = formatDate(coupon.expiresAt);

  const isCode = coupon.type === "code";

  return (
    <section className="space-y-8">
      {/* How to redeem */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-light)] text-[var(--brand-purple)]">
            {isCode ? (
              <TicketPercent size={22} />
            ) : (
              <Tag size={22} />
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-[var(--brand-navy)] sm:text-xl">
              How to Redeem This {isCode ? "Coupon" : "Deal"}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Follow these simple steps to enjoy the offer.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {isCode ? (
            <>
              <div className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-light)] text-sm font-bold text-[var(--brand-purple)]">
                  1
                </span>
                <div>
                  <h3 className="font-semibold text-[var(--brand-navy)]">
                    Copy the coupon code
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    Click the Get Coupon button to open the store offer in a
                    new tab and copy the available discount code.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-light)] text-sm font-bold text-[var(--brand-purple)]">
                  2
                </span>
                <div>
                  <h3 className="font-semibold text-[var(--brand-navy)]">
                    Visit the store
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    Browse the store and add your preferred products to your
                    shopping cart.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-light)] text-sm font-bold text-[var(--brand-purple)]">
                  3
                </span>
                <div>
                  <h3 className="font-semibold text-[var(--brand-navy)]">
                    Apply the coupon at checkout
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    Paste the copied code into the coupon or promo code field
                    during checkout and check whether the discount is applied.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-light)] text-sm font-bold text-[var(--brand-purple)]">
                  1
                </span>
                <div>
                  <h3 className="font-semibold text-[var(--brand-navy)]">
                    Visit the store offer
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    Click the Get Deal button to open the store's offer page.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-light)] text-sm font-bold text-[var(--brand-purple)]">
                  2
                </span>
                <div>
                  <h3 className="font-semibold text-[var(--brand-navy)]">
                    Explore the offer
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    Review the available products and offer details on the
                    store's website.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-light)] text-sm font-bold text-[var(--brand-purple)]">
                  3
                </span>
                <div>
                  <h3 className="font-semibold text-[var(--brand-navy)]">
                    Complete your purchase
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    Follow the store's instructions to claim the deal and
                    complete your purchase.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Offer information */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-light)] text-[var(--brand-purple)]">
            <CalendarDays size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[var(--brand-navy)] sm:text-xl">
              Offer Information
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Important details about this offer.
            </p>
          </div>
        </div>

        <div className="divide-y divide-[var(--border)]">
          <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
            <span className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <Tag size={16} />
              Offer Type
            </span>
            <span className="text-right text-sm font-semibold text-[var(--brand-navy)]">
              {isCode ? "Coupon Code" : "Deal"}
            </span>
          </div>

          {coupon.discount && (
            <div className="flex items-center justify-between gap-4 py-4">
              <span className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <TicketPercent size={16} />
                Discount
              </span>
              <span className="text-right text-sm font-semibold text-[var(--brand-purple)]">
                {coupon.discount}
              </span>
            </div>
          )}

          {startDate && (
            <div className="flex items-center justify-between gap-4 py-4">
              <span className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <Clock3 size={16} />
                Valid From
              </span>
              <span className="text-right text-sm font-semibold text-[var(--brand-navy)]">
                {startDate}
              </span>
            </div>
          )}

          {expiryDate && (
            <div className="flex items-center justify-between gap-4 py-4">
              <span className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <CalendarDays size={16} />
                Expiry Date
              </span>
              <span className="text-right text-sm font-semibold text-[var(--brand-navy)]">
                {expiryDate}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 py-4 last:pb-0">
            <span className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <ShieldCheck size={16} />
              Verification
            </span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-navy)]">
              {coupon.isVerified ? (
                <>
                  <CheckCircle2
                    size={16}
                    className="text-emerald-600"
                  />
                  Verified Offer
                </>
              ) : (
                "Community Offer"
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Store information */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-7">
        <h2 className="text-lg font-bold text-[var(--brand-navy)] sm:text-xl">
          About {coupon.store.name}
        </h2>

        <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
          Explore more coupons and deals from {coupon.store.name} and discover
          available savings on your next purchase.
        </p>

        <Link
          href={`/stores/${coupon.store.slug}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-purple)] transition-colors hover:text-[var(--accent-hover)]"
        >
          View all {coupon.store.name} offers
          <ExternalLink size={15} />
        </Link>
      </div>
    </section>
  );
}
