
"use client";

import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
} from "lucide-react";

interface UserEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onRefresh?: () => void;
}

export default function UserEmptyState({
  hasFilters = false,
  onClearFilters,
  onRefresh,
}: UserEmptyStateProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-light)] text-[var(--brand-purple)]">
        {hasFilters ? (
          <Search size={25} />
        ) : (
          <Users size={25} />
        )}
      </div>

      <h3 className="mt-4 text-base font-semibold text-gray-900">
        {hasFilters ? "No users found" : "No users yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
        {hasFilters
          ? "We couldn't find any users matching your current filters. Try adjusting your search or clearing the filters."
          : "There are no registered users yet. New user accounts will appear here when someone signs up."}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {hasFilters && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-purple)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]"
          >
            <Search size={15} />
            Clear filters
          </button>
        )}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
