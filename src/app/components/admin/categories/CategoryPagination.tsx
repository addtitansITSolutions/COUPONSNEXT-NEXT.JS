"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type CategoryPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
};

function getPageNumbers(
  currentPage: number,
  totalPages: number
): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
  }

  if (currentPage <= 4) {
    return [
      1,
      2,
      3,
      4,
      5,
      "...",
      totalPages,
    ];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

export default function CategoryPagination({
  page,
  totalPages,
  total,
  limit,
  isLoading = false,
  onPageChange,
}: CategoryPaginationProps) {
  if (total === 0 || totalPages <= 1) {
    return null;
  }

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pageNumbers = getPageNumbers(
    page,
    totalPages
  );

  return (
    <div className="flex flex-col gap-4 border-t border-[var(--border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      {/* Results information */}
      <p className="text-sm text-[var(--brand-navy)]/55">
        Showing{" "}
        <span className="font-medium text-[var(--brand-navy)]">
          {start}
        </span>
        {"–"}
        <span className="font-medium text-[var(--brand-navy)]">
          {end}
        </span>{" "}
        of{" "}
        <span className="font-medium text-[var(--brand-navy)]">
          {total}
        </span>{" "}
        categories
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          type="button"
          onClick={() =>
            onPageChange(page - 1)
          }
          disabled={
            page === 1 || isLoading
          }
          aria-label="Previous page"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--brand-navy)]/65 transition hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={17} />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map(
            (pageNumber, index) => {
              if (pageNumber === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex h-9 w-9 items-center justify-center text-sm text-[var(--brand-navy)]/40"
                  >
                    …
                  </span>
                );
              }

              const isCurrent =
                pageNumber === page;

              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() =>
                    onPageChange(pageNumber)
                  }
                  disabled={isLoading}
                  aria-current={
                    isCurrent
                      ? "page"
                      : undefined
                  }
                  className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition disabled:cursor-not-allowed ${
                    isCurrent
                      ? "bg-[var(--brand-purple)] text-white shadow-sm"
                      : "text-[var(--brand-navy)]/65 hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)]"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            }
          )}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={() =>
            onPageChange(page + 1)
          }
          disabled={
            page === totalPages ||
            isLoading
          }
          aria-label="Next page"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--brand-navy)]/65 transition hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}