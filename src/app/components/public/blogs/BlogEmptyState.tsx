import Link from "next/link";
import { ArrowRight, BookOpen, Search } from "lucide-react";

interface BlogEmptyStateProps {
  onClearFilters: () => void;
}

export default function BlogEmptyState({
  onClearFilters,
}: BlogEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border)] bg-white px-6 py-16 text-center sm:px-10">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--accent-light)]">
        <Search
          className="h-9 w-9 text-[var(--brand-purple)]"
          strokeWidth={1.6}
        />
      </div>

      <span className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-purple)]">
        No articles found
      </span>

      <h3 className="mb-3 max-w-lg text-2xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-3xl">
        Nothing to read here just yet.
      </h3>

      <p className="mb-8 max-w-md text-sm leading-7 text-[var(--muted)]">
        We couldn't find any articles matching your search or selected filters.
        Try adjusting your search or explore all our latest shopping guides and
        money-saving tips.
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-purple)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          <BookOpen className="h-4 w-4" />
          Clear all filters
        </button>
      </div>
    </div>
  );
}