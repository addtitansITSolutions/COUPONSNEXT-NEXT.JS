"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Store as StoreIcon,
  X,
} from "lucide-react";

interface PublicStore {
  id: string;
  name: string;
  slug: string;
}

interface StorePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface StoreDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const INITIAL_PAGINATION: StorePagination = {
  page: 1,
  limit: 5,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export default function StoreDropdown({
  value,
  onChange,
}: StoreDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [pagination, setPagination] =
    useState<StorePagination>(INITIAL_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedLabel, setSelectedLabel] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const fetchStores = useCallback(
    async (page: number, searchTerm: string, signal: AbortSignal) => {
      const requestId = ++requestIdRef.current;

      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: String(page),
          limit: "5",
          sort: "alphabetical",
        });

        if (searchTerm.trim()) {
          params.set("search", searchTerm.trim());
        }

        const response = await fetch(
          `/api/public/stores?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
            signal,
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load stores.");
        }

        if (requestId !== requestIdRef.current) return;

        setStores(data.stores ?? []);
        setPagination(data.pagination ?? INITIAL_PAGINATION);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        if (requestId !== requestIdRef.current) return;

        setStores([]);
        setPagination(INITIAL_PAGINATION);
        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading stores."
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(() => {
      fetchStores(1, search, controller.signal);
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, search, fetchStores]);

  const handlePageChange = (nextPage: number) => {
    if (loading || nextPage < 1 || nextPage > pagination.totalPages) {
      return;
    }

    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetchStores(nextPage, search, controller.signal);
  };

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSelect = (store: PublicStore | null) => {
    onChange(store?.slug ?? "");
    setSelectedLabel(store?.name ?? "");
    setIsOpen(false);
  };

  const handleSearchChange = (nextValue: string) => {
    setSearch(nextValue);
  };

  const selectedStore = stores.find((store) => store.slug === value);

  const displayLabel = !value
    ? "All stores"
    : selectedStore?.name ||
      selectedLabel ||
      value.replace(/-/g, " ");

  return (
    <div ref={containerRef} className="relative w-full min-w-0 max-w-full">
        <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
        className="flex h-10 w-full min-w-0 max-w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 text-left text-sm text-gray-700 outline-none transition hover:border-gray-300 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10"
        >
        <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
            <StoreIcon
            size={15}
            className="shrink-0 text-gray-400"
            />

            <span className="min-w-0 flex-1 truncate">
            {displayLabel}
            </span>
        </span>

        <ChevronDown
            size={16}
            className={`shrink-0 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
            }`}
        />
        </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          {/* Search */}
          <div className="border-b border-gray-100 p-3">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                autoFocus
                onChange={(event) =>
                  handleSearchChange(event.target.value)
                }
                placeholder="Search active stores..."
                aria-label="Search active stores"
                className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-sm outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  aria-label="Clear store search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Store options */}
          <div
            className="max-h-60 overflow-y-auto p-1.5"
            role="listbox"
            aria-label="Stores"
          >
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => handleSelect(null)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)] ${
                !value
                  ? "bg-[var(--accent-light)] text-[var(--brand-purple)]"
                  : ""
              }`}
            >
              <span>All stores</span>

              {!value && (
                <Check
                  size={15}
                  className="text-[var(--brand-purple)]"
                />
              )}
            </button>

            {loading && stores.length === 0 && (
              <p className="px-3 py-5 text-center text-sm text-gray-500">
                Loading stores...
              </p>
            )}

            {!loading && !error && stores.length === 0 && (
              <p className="px-3 py-5 text-center text-sm text-gray-500">
                No active stores found.
              </p>
            )}

            {stores.map((store) => (
              <button
                key={store.id}
                type="button"
                role="option"
                aria-selected={value === store.slug}
                onClick={() => handleSelect(store)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)] ${
                  value === store.slug
                    ? "bg-[var(--accent-light)] text-[var(--brand-purple)]"
                    : ""
                }`}
              >
                <span className="truncate">{store.name}</span>

                {value === store.slug && (
                  <Check
                    size={15}
                    className="shrink-0 text-[var(--brand-purple)]"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="border-t border-gray-100 px-3 py-2">
              <p role="alert" className="text-xs text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() => {
                  const controller = new AbortController();
                  abortControllerRef.current = controller;
                  fetchStores(1, search, controller.signal);
                }}
                className="mt-1 text-xs font-semibold text-[var(--brand-purple)] hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-3 py-2.5">
            <span className="text-xs text-gray-500">
              {loading
                ? "Loading..."
                : `${pagination.total} active stores`}
              <span className="ml-1">
                · {pagination.page}/{Math.max(pagination.totalPages, 1)}
              </span>
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous store page"
                disabled={loading || !pagination.hasPreviousPage}
                onClick={() =>
                  handlePageChange(pagination.page - 1)
                }
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                aria-label="Next store page"
                disabled={loading || !pagination.hasNextPage}
                onClick={() =>
                  handlePageChange(pagination.page + 1)
                }
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
