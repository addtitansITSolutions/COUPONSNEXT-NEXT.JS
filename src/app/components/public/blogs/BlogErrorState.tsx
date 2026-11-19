"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

interface BlogErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export default function BlogErrorState({
  message,
  onRetry,
}: BlogErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-red-100 bg-white px-6 py-14 text-center sm:px-10">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
        <AlertCircle className="h-8 w-8 text-red-500" strokeWidth={1.7} />
      </div>

      <h3 className="mb-2 text-xl font-bold text-[var(--brand-navy)]">
        Unable to load articles
      </h3>

      <p className="mb-7 max-w-md text-sm leading-6 text-[var(--muted)]">
        {message ||
          "Something went wrong while loading the articles. Please check your connection and try again."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-purple)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}