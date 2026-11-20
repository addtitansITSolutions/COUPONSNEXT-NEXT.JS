
"use client";

import { ArrowLeft } from "lucide-react";

export default function GoBackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-7 py-3.5 text-sm font-bold text-[var(--brand-navy)] transition hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)] sm:w-auto"
    >
      <ArrowLeft size={17} />
      Go Back
    </button>
  );
}
