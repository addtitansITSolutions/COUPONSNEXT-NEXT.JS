
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { useUser, type UserRole, } from "@/lib/hooks/useUsers";

interface UserDropdownProps {
  value: string;
  onChange: (value: string) => void;
  role?: UserRole | "";
}

export default function UserDropdown({
  value,
  onChange,
  role = "admin",
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  const {
    users,
    pagination,
    loading,
    error,
    setSearch: updateSearch,
    setRole,
    setIsActive,
    setPage,
    refresh,
  } = useUser({
    initialLimit: 5,
    initialFilters: {
      role,
      isActive: true,
    },
  });

  // Keep the dropdown filters synchronized with the supplied role.
  useEffect(() => {
    setRole(role);
  }, [role, setRole]);

  // Only show active users in this dropdown.
  useEffect(() => {
    setIsActive(true);
  }, [setIsActive]);

  // Sync the dropdown search with the users hook.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateSearch(search);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, updateSearch]);

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

  const handleSelect = (userId: string, userName: string) => {
    onChange(userId);
    setSelectedLabel(userName);
    setIsOpen(false);
  };

  const selectedUser = users.find((user) => user.id === value);

  const displayLabel =
    value === ""
      ? "All authors"
      : selectedUser?.name || selectedLabel || "Selected author";

  const loadingUsers = loading;

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 text-left text-sm text-gray-700 outline-none transition hover:border-gray-300 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10"
      >
        <span className="flex min-w-0 items-center gap-2">
          <UserRound
            size={15}
            className="shrink-0 text-gray-400"
          />
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
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search authors..."
                aria-label="Search authors"
                className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-sm outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear author search"
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
              aria-selected={value === ""}
              onClick={() => handleSelect("", "")}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition ${
                value === ""
                  ? "bg-[var(--accent-light)] text-[var(--brand-purple)]"
                  : ""
              } hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)]`}
            >
              <span>All authors</span>

              {value === "" && (
                <Check
                  size={15}
                  className="text-[var(--brand-purple)]"
                />
              )}
            </button>

            {loadingUsers && users.length === 0 && (
              <p className="px-3 py-5 text-center text-sm text-gray-500">
                Loading authors...
              </p>
            )}

            {!loadingUsers && !error && users.length === 0 && (
              <p className="px-3 py-5 text-center text-sm text-gray-500">
                No active authors found.
              </p>
            )}

            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                role="option"
                aria-selected={value === user.id}
                onClick={() => handleSelect(user.id, user.name)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition ${
                  value === user.id
                    ? "bg-[var(--accent-light)] text-[var(--brand-purple)]"
                    : "hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)]"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {user.name}
                  </span>
                  <span className="block truncate text-xs text-gray-500">
                    {user.email}
                  </span>
                </span>

                {value === user.id && (
                  <Check
                    size={15}
                    className="shrink-0 text-[var(--brand-purple)]"
                  />
                )}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-3 py-2">
              <p role="alert" className="text-xs text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={refresh}
                disabled={loadingUsers}
                className="shrink-0 text-xs font-medium text-[var(--brand-purple)] hover:underline disabled:opacity-50"
              >
                Retry
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-3 py-2.5">
            <span className="text-xs text-gray-500">
              {loadingUsers
                ? "Loading..."
                : `${pagination.total} active authors`}
              <span className="ml-1">
                · {pagination.page}/{Math.max(pagination.totalPages, 1)}
              </span>
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous author page"
                disabled={loadingUsers || pagination.page <= 1}
                onClick={() => setPage(pagination.page - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                aria-label="Next author page"
                disabled={
                  loadingUsers ||
                  !pagination.hasNextPage
                }
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