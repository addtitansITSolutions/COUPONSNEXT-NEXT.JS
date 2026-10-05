"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  TicketPercent,
  Tags,
  Image,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const navigationItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Stores",
    href: "/admin/stores",
    icon: Store,
  },
  {
    label: "Coupons",
    href: "/admin/coupons",
    icon: TicketPercent,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    label: "Banners",
    href: "/admin/banners",
    icon: Image,
  },
  {
    label: "Blogs",
    href: "/admin/blogs",
    icon: FileText,
  },
];

const managementItems = [
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar({
  isOpen,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-screen w-64 min-h-0 flex-col
          border-r border-[var(--border)]
          bg-white
          transition-transform duration-300 ease-in-out
          lg:static lg:z-auto lg:translate-x-0
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Brand */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-[var(--border)] px-6">
          <Link
            href="/admin"
            onClick={onClose}
            className="flex flex-col"
          >
            <span className="text-xl font-bold leading-none tracking-tight">
              <span className="text-[var(--brand-purple)]">
                Coupons
              </span>

              <span className="text-[var(--brand-yellow)]">
                Next
              </span>
            </span>

            <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--brand-navy)]/50">
              Admin Panel
            </span>
          </Link>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-[var(--brand-navy)]/60 transition hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)] lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          {/* Main */}
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-navy)]/40">
            Main
          </p>

          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group flex items-center gap-3 rounded-xl px-3 py-2.5
                    text-sm font-medium
                    transition-all duration-200
                    ${
                      active
                        ? "bg-[var(--accent-light)] text-[var(--brand-purple)]"
                        : "text-[var(--brand-navy)]/65 hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)]"
                    }
                  `}
                >
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.2 : 1.9}
                    className="shrink-0"
                  />

                  <span>{item.label}</span>

                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--brand-purple)]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-[var(--border)]" />

          {/* Management */}
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-navy)]/40">
            Management
          </p>

          <div className="space-y-1">
            {managementItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group flex items-center gap-3 rounded-xl px-3 py-2.5
                    text-sm font-medium
                    transition-all duration-200
                    ${
                      active
                        ? "bg-[var(--accent-light)] text-[var(--brand-purple)]"
                        : "text-[var(--brand-navy)]/65 hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)]"
                    }
                  `}
                >
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.2 : 1.9}
                    className="shrink-0"
                  />

                  <span>{item.label}</span>

                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--brand-purple)]" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-[var(--border)] p-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--brand-navy)]/65 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} strokeWidth={1.9} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}