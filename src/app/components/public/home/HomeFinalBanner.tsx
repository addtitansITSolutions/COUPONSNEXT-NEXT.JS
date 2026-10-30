
import Link from "next/link";
import {
  ArrowRight,
  TicketPercent,
  Sparkles,
  Tag,
  ShoppingBag,
} from "lucide-react";

export default function HomeFinalBanner() {
  return (
    <section className="bg-white px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[var(--brand-navy)] px-6 py-12 shadow-xl sm:px-10 sm:py-16 lg:px-16 lg:py-20">

        {/* Background Decorations */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[var(--brand-purple)]/35 blur-3xl sm:h-[450px] sm:w-[450px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-[var(--brand-yellow)]/10 blur-3xl"
        />

        {/* Decorative Icons */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[12%] top-[18%] hidden rotate-12 text-white/[0.07] lg:block"
        >
          <TicketPercent size={150} strokeWidth={1} />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[15%] right-[30%] hidden -rotate-12 text-[var(--brand-yellow)]/15 lg:block"
        >
          <Tag size={65} strokeWidth={1.2} />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-3xl text-center">

          {/* <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--brand-yellow)]/30 bg-[var(--brand-yellow)]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--brand-yellow)] sm:text-sm">
            <Sparkles size={15} />
            Your smarter way to shop
          </div> */}

          <h2 className="font-heading text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
            Great Deals Are
            <br className="hidden sm:block" />{" "}
            Just One Click{" "}
            <span className="text-[var(--brand-yellow)]">
              Away!
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
            Don't pay more than you should. Explore amazing
            coupon codes and exclusive deals from your favorite
            stores with CouponsNext.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">

            <Link
              href="/coupons"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-purple)] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--brand-purple)]/25 transition-all duration-200 hover:bg-[var(--accent-hover)] active:scale-95 sm:w-auto"
            >
              Explore Coupons
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/stores"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3 text-sm font-bold text-white transition-all duration-200 hover:border-[var(--brand-yellow)] hover:bg-white/10 active:scale-95 sm:w-auto"
            >
              <ShoppingBag size={17} />
              Browse Stores
            </Link>

          </div>

          <p className="mt-7 text-xs font-medium text-white/40">
            Discover offers. Shop smarter. Save more.
          </p>
        </div>
      </div>
    </section>
  );
}
