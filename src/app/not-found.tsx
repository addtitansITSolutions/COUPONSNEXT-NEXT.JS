
import Link from "next/link";
import { ArrowLeft, ArrowRight, Home, Search } from "lucide-react";
import GoBackButton from "@/components/public/GoBackButton";
import PublicHeader from "./components/public/layout/PublicHeader";
import PublicFooter from "./components/public/layout/PublicFooter";

export default function NotFound() {
  return (
    <>
    <PublicHeader />
    <main className="relative flex items-center justify-center overflow-hidden bg-[var(--background)] px-5 py-6">
      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[var(--brand-purple)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[var(--brand-yellow)]/15 blur-3xl" />

      <div className="relative mx-auto w-full max-w-2xl text-center">
        {/* 404 Illustration */}
        <div className="relative mx-auto mb-8 flex h-52 w-full max-w-md items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[var(--brand-purple)]/5 blur-2xl" />

          <div className="relative flex items-center justify-center gap-2">
            <span className="text-[100px] font-black leading-none tracking-tighter text-[var(--brand-purple)] sm:text-[140px]">
              4
            </span>

            <div className="relative flex h-24 w-24 rotate-[-12deg] items-center justify-center rounded-2xl border-2 border-dashed border-[var(--brand-yellow)] bg-white shadow-xl sm:h-32 sm:w-32">
              <div className="absolute -left-2 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[var(--background)]" />
              <div className="absolute -right-2 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[var(--background)]" />

              <span className="text-4xl font-black text-[var(--brand-purple)] sm:text-5xl">
                ?
              </span>

              <span className="absolute -bottom-3 rounded-full bg-[var(--brand-yellow)] px-3 py-1 text-[9px] font-black tracking-widest text-[var(--brand-navy)]">
                LOST!
              </span>
            </div>

            <span className="text-[100px] font-black leading-none tracking-tighter text-[var(--brand-purple)] sm:text-[140px]">
              4
            </span>
          </div>

          <div className="absolute right-5 top-5 h-3 w-3 rounded-full bg-[var(--brand-yellow)] sm:right-12" />
          <div className="absolute bottom-5 left-8 h-4 w-4 rounded-full bg-[var(--brand-purple)]/30" />
        </div>

        {/* Message */}
        <div className="mx-auto max-w-lg">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--brand-purple)]/15 bg-[var(--brand-purple)]/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--brand-purple)]">
            Page not found
          </span>

          <h1 className="text-3xl font-black tracking-tight text-[var(--brand-navy)] sm:text-5xl">
            Oops! This page is
            <span className="text-[var(--brand-purple)]"> missing.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[var(--muted)] sm:text-base">
            Looks like this page has gone on a little adventure.
            The link may be broken, or the page may have been moved.
            Let's get you back to finding amazing deals!
          </p>
        </div>

        <GoBackButton />

        {/* Search suggestion */}
        <div className="mt-10 border-t border-[var(--border)] pt-6">
          <p className="text-sm text-[var(--muted)]">
            Looking for something specific?
          </p>

          <Link
            href="/search"
            className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-purple)] transition hover:text-[var(--accent-hover)]"
          >
            <Search size={16} />
            Explore stores, coupons and deals
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
    <PublicFooter />
    </>
  );
}
