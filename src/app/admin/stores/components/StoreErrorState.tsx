"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

interface StoreErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function StoreErrorState({
  message,
  onRetry,
}: StoreErrorStateProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-red-100 bg-white px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <AlertCircle
          size={26}
          className="text-red-500"
        />
      </div>

      <h3 className="mt-4 text-base font-semibold text-gray-900">
        Failed to load stores
      </h3>

      <p className="mt-1 max-w-md text-sm text-gray-500">
        {message ||
          "Something went wrong while loading stores. Please try again."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--brand-purple)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]"
      >
        <RefreshCw size={16} />
        Try again
      </button>
    </div>
  );
}