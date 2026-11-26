"use client";

import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

interface BlogLoadMoreProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function BlogLoadMore({
  loading,
  error,
  onRetry,
}: BlogLoadMoreProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-10">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--brand-purple)]/20 border-t-[var(--brand-purple)]" />
        <span className="text-sm font-medium text-[var(--muted)]">
          Loading more articles...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>

        <p className="mb-4 max-w-md text-sm text-[var(--muted)]">
          {error}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--brand-purple)] transition-colors hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)]"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm font-medium text-[var(--muted)]">
      <CheckCircle2 className="h-4 w-4 text-[var(--brand-purple)]" />
      You&lsquo;ve reached the end of the articles.
    </div>
  );
}