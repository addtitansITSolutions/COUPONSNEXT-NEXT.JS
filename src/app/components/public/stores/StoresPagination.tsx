
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface StorePaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface StoresPaginationProps {
  pagination: StorePaginationData;
  onPageChange: (page: number) => void;
}

export default function StoresPagination({
  pagination,
  onPageChange,
}: StoresPaginationProps) {
  const { page, totalPages, total, limit, hasNextPage, hasPreviousPage } =
    pagination;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <nav
      aria-label="Store pagination"
      className="mt-12 flex flex-col gap-5 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-center text-sm text-gray-500 sm:text-left">
        Showing{" "}
        <span className="font-semibold text-[var(--brand-navy)]">
          {startItem}–{endItem}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-[var(--brand-navy)]">
          {total}
        </span>{" "}
        stores
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1">
        <button
          type="button"
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-10 items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600 transition hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          {/* <span>Previous</span> */}
        </button>

        {getPageNumbers().map((pageNumber) => {
          const isActive = pageNumber === page;

          return (
            <button
              key={pageNumber}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => onPageChange(pageNumber)}
              className={`h-10 min-w-10 rounded-xl border px-3 text-sm font-semibold transition ${
                isActive
                  ? "border-[var(--brand-purple)] bg-[var(--brand-purple)] text-white shadow-md shadow-purple-500/20"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)]"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          type="button"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-10 items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600 transition hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {/* <span>Next</span> */}
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
