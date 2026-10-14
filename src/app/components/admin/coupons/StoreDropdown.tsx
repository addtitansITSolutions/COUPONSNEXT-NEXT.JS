"use client";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Store as StoreIcon,
  X,
} from "lucide-react";

import { useStores } from "@/lib/hooks/useStores";

interface StoreDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StoreDropdown({
  value,
  onChange,
}: StoreDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  const {
    stores,
    pagination,
    loading,
    error,
    setSearch: setStoreSearch,
    setPage,
  } = useStores({
    initialLimit: 5,
    initialIsActive: "true",
  });

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

  const handleSearch = (nextValue: string) => {
    setSearch(nextValue);
    setStoreSearch(nextValue);
  };

  const handleSelect = (storeId: string, storeName: string) => {
    onChange(storeId);
    setSelectedLabel(storeName);
    setIsOpen(false);
  };

  const selectedStore = stores.find((store) => store.id === value);
  const displayLabel = !value ? "All stores" : selectedStore?.name || selectedLabel || "Selected store";

  return (
    <div ref={containerRef} className="relative min-w-0">
      {/* <label className="mb-1.5 block text-sm font-medium text-gray-700">
        Store
      </label> */}

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 text-left text-sm text-gray-700 outline-none transition hover:border-gray-300 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10"
      >
        <span className="flex min-w-0 items-center gap-2">
          <StoreIcon size={15} className="shrink-0 text-gray-400" />
          <span className="truncate">{displayLabel}</span>
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
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
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Search active stores..."
                aria-label="Search active stores"
                className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-sm outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => handleSearch("")}
                  aria-label="Clear store search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto p-1.5" role="listbox">
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => handleSelect("", "")}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)] ${!value ? "bg-[var(--accent-light)] text-[var(--brand-purple)]" : ""}`}
            >
              <span>All stores</span>
              {!value && (
                <Check size={15} className="text-[var(--brand-purple)]" />
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
                aria-selected={value === store.id}
                onClick={() => handleSelect(store.id, store.name)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)] ${value === store.id ? "bg-[var(--accent-light)] text-[var(--brand-purple)]" : ""}`}
              >
                <span className="truncate">{store.name}</span>
                {value === store.id && (
                  <Check
                    size={15}
                    className="shrink-0 text-[var(--brand-purple)]"
                  />
                )}
              </button>
            ))}
          </div>

          {error && (
            <div className="border-t border-gray-100 px-3 py-2">
              <p role="alert" className="text-xs text-red-600">
                {error}
              </p>
            </div>
          )}

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
                onClick={() => setPage(pagination.page - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                aria-label="Next store page"
                disabled={loading || !pagination.hasNextPage}
                onClick={() => setPage(pagination.page + 1)}
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
