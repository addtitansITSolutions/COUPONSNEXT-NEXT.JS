"use client";

import { Store as StoreIcon, X } from "lucide-react";

interface StoreEmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export default function StoreEmptyState({
  hasFilters,
  onClearFilters,
}: StoreEmptyStateProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <StoreIcon size={26} className="text-gray-400" />
      </div>

      {hasFilters ? (
        <>
          <h3 className="mt-4 text-base font-semibold text-gray-900">
            No stores found
          </h3>

          <p className="mt-1 max-w-md text-sm text-gray-500">
            No stores match your current search or filters.
            Try adjusting your filters or search term.
          </p>

          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
            >
              <X size={16} />
              Clear filters
            </button>
          )}
        </>
      ) : (
        <>
          <h3 className="mt-4 text-base font-semibold text-gray-900">
            No stores yet
          </h3>

          <p className="mt-1 max-w-md text-sm text-gray-500">
            There are no stores in your database yet.
            Create your first store to get started.
          </p>
        </>
      )}
    </div>
  );
}