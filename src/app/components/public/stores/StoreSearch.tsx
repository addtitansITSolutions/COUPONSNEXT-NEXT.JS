
"use client";

import { Search, X } from "lucide-react";

interface StoreSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StoreSearch({
  value,
  onChange,
}: StoreSearchProps) {
  return (
    <div className="relative w-full">
      <Search
        size={17}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
      />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search stores..."
        aria-label="Search stores"
        className="h-11 w-full rounded-lg border border-[var(--border)] bg-white py-2.5 pl-9 pr-2 text-sm text-[var(--brand-navy)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10"
      />
    </div>
  );
}
