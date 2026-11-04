
"use client";

import { AlertCircle, RefreshCw, Search, Store } from "lucide-react";

interface StoresEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function StoresEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: StoresEmptyStateProps) {
  const isError = title.toLowerCase().includes("unable");

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-5 py-12 text-center">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
          isError
            ? "bg-red-50 text-red-500"
            : "bg-purple-50 text-[var(--brand-purple)]"
        }`}
      >
        {isError ? (
          <AlertCircle size={30} />
        ) : (
          <Search size={30} />
        )}
      </div>

      <h3 className="mt-5 text-xl font-bold text-[var(--brand-navy)]">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--brand-purple)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
        >
          {isError ? (
            <RefreshCw size={16} />
          ) : (
            <Store size={16} />
          )}
          {actionLabel}
        </button>
      )}
    </div>
  );
}
