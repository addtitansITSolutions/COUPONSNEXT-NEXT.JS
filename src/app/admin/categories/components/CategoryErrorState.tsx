"use client";

import {
  RefreshCw,
} from "lucide-react";

type CategoryErrorStateProps = {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
};

export default function CategoryErrorState({
  message,
  isRetrying,
  onRetry,
}: CategoryErrorStateProps) {
  return (
    <div className="flex min-h-60 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
        <RefreshCw size={21} />
      </div>

      <h3 className="mt-4 text-base font-semibold text-[var(--brand-navy)]">
        Unable to load categories
      </h3>

      <p className="mt-1 max-w-md text-sm leading-6 text-[var(--brand-navy)]/55">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--brand-purple)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw
          size={16}
          className={
            isRetrying
              ? "animate-spin"
              : ""
          }
        />

        {isRetrying
          ? "Retrying..."
          : "Try Again"}
      </button>
    </div>
  );
}