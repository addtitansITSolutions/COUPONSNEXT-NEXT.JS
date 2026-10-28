
import Link from "next/link";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Tag,
  Sparkles,
} from "lucide-react";

export default function HomeHero() {
  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ backgroundColor: "var(--brand-navy)" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ backgroundColor: "var(--brand-purple)", opacity: 0.28 }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-52 left-[25%] h-[380px] w-[380px] rounded-full blur-3xl"
        style={{ backgroundColor: "var(--brand-yellow)", opacity: 0.08 }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-[1.1fr_0.9fr] md:gap-10 lg:px-8 lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/90 sm:text-sm">
            <Sparkles size={15} style={{ color: "var(--brand-yellow)" }} />
            Find your next great saving
          </div>

          <h1 className="mt-6 max-w-2xl font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Good deals.
            <br />
            <span style={{ color: "var(--brand-yellow)" }}>
              Better shopping.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
            Discover promo codes, exclusive deals, and offers from the stores
            you love. Your next saving starts here.
          </p>

          <form
            action="/search"
            className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-white/10 bg-white p-2 shadow-2xl shadow-black/20"
          >
            <Search
              size={20}
              className="ml-2 shrink-0"
              style={{ color: "var(--muted)" }}
            />

            <input
              type="search"
              name="q"
              required
              placeholder="Search stores, coupons and deals"
              aria-label="Search stores, coupons and deals"
              className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
              style={{ color: "var(--foreground)" }}
            />

            <button
              type="submit"
              className="flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)] sm:px-5"
              style={{ backgroundColor: "var(--brand-purple)" }}
            >
              <span className="hidden sm:inline">Search</span>
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-xs font-medium text-white/70 sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={16} style={{ color: "var(--brand-yellow)" }} />
              Handpicked offers
            </span>
            <span className="inline-flex items-center gap-2">
              <Tag size={16} style={{ color: "var(--brand-yellow)" }} />
              Codes & deals
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md md:ml-auto">
          <div
            aria-hidden="true"
            className="absolute -inset-5 rounded-[2rem] blur-2xl"
            style={{ backgroundColor: "var(--brand-purple)", opacity: 0.2 }}
          />

          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/55">
                  The smart way to shop
                </p>
                <h2 className="mt-2 font-heading text-xl font-bold text-white sm:text-2xl">
                  A little saving goes a long way.
                </h2>
              </div>

              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: "var(--brand-yellow)",
                  color: "var(--brand-navy)",
                }}
              >
                <Sparkles size={22} />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-4 rounded-2xl bg-white p-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: "var(--accent-light)",
                    color: "var(--brand-purple)",
                  }}
                >
                  <Tag size={23} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold" style={{ color: "var(--foreground)" }}>
                    Promo codes
                  </p>
                  <p className="mt-1 text-xs leading-5" style={{ color: "var(--muted)" }}>
                    Extra savings at checkout
                  </p>
                </div>
                <span
                  className="rounded-lg px-2.5 py-1.5 text-xs font-extrabold"
                  style={{
                    backgroundColor: "var(--brand-yellow)",
                    color: "var(--brand-navy)",
                  }}
                >
                  SAVE
                </span>
              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-white p-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: "var(--brand-navy)",
                    color: "var(--brand-yellow)",
                  }}
                >
                  <ShieldCheck size={23} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold" style={{ color: "var(--foreground)" }}>
                    Curated offers
                  </p>
                  <p className="mt-1 text-xs leading-5" style={{ color: "var(--muted)" }}>
                    Discover deals worth checking
                  </p>
                </div>
                <span
                  className="rounded-lg px-2.5 py-1.5 text-xs font-extrabold"
                  style={{
                    backgroundColor: "var(--accent-light)",
                    color: "var(--brand-purple)",
                  }}
                >
                  DEALS
                </span>
              </div>
            </div>

            <Link
              href="/coupons"
              className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explore all offers
              <ArrowRight size={17} style={{ color: "var(--brand-yellow)" }} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
