"use client";

import { Bell, Menu, UserCircle } from "lucide-react";

type AdminHeaderProps = {
  onMenuClick: () => void;
};

export default function AdminHeader({
  onMenuClick,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[var(--border)] bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="rounded-xl p-2 text-[var(--brand-navy)]/70 transition hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)] lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="text-sm font-medium text-[var(--brand-navy)]/50">
            Admin Panel
          </p>

          <h1 className="text-lg font-semibold text-[var(--brand-navy)]">
            Dashboard
          </h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl p-2.5 text-[var(--brand-navy)]/65 transition hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)]"
        >
          <Bell size={20} strokeWidth={1.9} />

          {/* Notification indicator */}
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--brand-yellow)]" />
        </button>

        {/* Divider */}
        <div className="hidden h-8 w-px bg-[var(--border)] sm:block" />

        {/* Admin Profile */}
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-[var(--accent-light)]"
        >
          <UserCircle
            size={34}
            strokeWidth={1.6}
            className="text-[var(--brand-purple)]"
          />

          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-[var(--brand-navy)]">
              Admin
            </p>

            <p className="text-xs text-[var(--brand-navy)]/45">
              Super Admin
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}