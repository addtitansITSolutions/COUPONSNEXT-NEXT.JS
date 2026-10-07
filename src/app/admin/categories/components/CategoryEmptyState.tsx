"use client";

import {
  FolderOpen,
  Plus,
} from "lucide-react";

type CategoryEmptyStateProps = {
  onAddCategory: () => void;
  hasFilters?: boolean;
};

export default function CategoryEmptyState({
  onAddCategory,
  hasFilters = false,
}: CategoryEmptyStateProps) {
  return (
    <div className="flex min-h-60 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-light)] text-[var(--brand-purple)]">
        <FolderOpen size={24} />
      </div>

      <h3 className="mt-4 text-base font-semibold text-[var(--brand-navy)]">
        {hasFilters
          ? "No matching categories"
          : "No categories found"}
      </h3>

      <p className="mt-1 max-w-md text-sm leading-6 text-[var(--brand-navy)]/55">
        {hasFilters
          ? "Try changing your search or filters to find the categories you're looking for."
          : "You haven't created any categories yet. Create your first category to start organizing stores, coupons, and blogs."}
      </p>

      {!hasFilters && (
        <button
          type="button"
          onClick={onAddCategory}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--brand-purple)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-hover)]"
        >
          <Plus
            size={17}
            strokeWidth={2.2}
          />

          Add Category
        </button>
      )}
    </div>
  );
}