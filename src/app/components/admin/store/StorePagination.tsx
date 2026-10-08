"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface StorePaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  disabled?: boolean;
}

export default function StorePagination({
  page,
  totalPages,
  total,
  limit,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onLimitChange,
  disabled = false,
}: StorePaginationProps) {
  if (total === 0) {
    return null;
  }

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (page > 3) {
      pages.push("ellipsis");
    }

    const startPage = Math.max(2, page - 1);
    const endPage = Math.min(totalPages - 1, page + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push("ellipsis");
    }

    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col gap-4 border-gray-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Result information */}
      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-medium text-gray-900">
            {start}
          </span>{" "}
          to{" "}
          <span className="font-medium text-gray-900">
            {end}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-900">
            {total}
          </span>{" "}
          stores
        </p>

        {/* Page size */}
        <select
          value={limit}
          onChange={(event) =>
            onLimitChange(Number(event.target.value))
          }
          disabled={disabled}
          className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Stores per page"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={
            disabled ||
            !hasPreviousPage ||
            page <= 1
          }
          aria-label="Previous page"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={17} />
        </button>

        {/* Page numbers */}
        {pageNumbers.map((pageNumber, index) => {
          if (pageNumber === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-9 w-9 items-center justify-center text-sm text-gray-400"
              >
                ...
              </span>
            );
          }

          const isCurrentPage = pageNumber === page;

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              disabled={disabled || isCurrentPage}
              aria-current={
                isCurrentPage ? "page" : undefined
              }
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition ${
                isCurrentPage
                  ? "bg-[var(--brand-purple)] text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              } disabled:cursor-not-allowed`}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={
            disabled ||
            !hasNextPage ||
            page >= totalPages
          }
          aria-label="Next page"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}