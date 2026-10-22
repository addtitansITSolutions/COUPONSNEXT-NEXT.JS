
"use client";

import { FileText, Search, RotateCcw } from "lucide-react";

interface BlogEmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export default function BlogEmptyState({
  hasFilters,
  onClearFilters,
}: BlogEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center sm:py-20">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-light)]">
        {hasFilters ? (
          <Search
            size={28}
            className="text-[var(--brand-purple)]"
          />
        ) : (
          <FileText
            size={28}
            className="text-[var(--brand-purple)]"
          />
        )}
      </div>

      <h2 className="text-lg font-semibold tracking-tight text-gray-900">
        {hasFilters ? "No matching blogs found" : "No blogs yet"}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
        {hasFilters
          ? "We couldn't find any blogs matching your current search or filters. Try changing your search or clearing the filters."
          : "Your blog collection is empty. Create your first blog post to start publishing content on CouponsNext."}
      </p>

      {hasFilters && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple)] focus:ring-offset-2"
        >
          <RotateCcw size={16} />
          Clear filters
        </button>
      )}
    </div>
  );
}
