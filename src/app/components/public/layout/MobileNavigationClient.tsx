"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Menu,
  Search,
  X,
} from "lucide-react";

const links = [
  { label: "Home", href: "/" },
  { label: "Stores", href: "/stores" },
  { label: "Coupons & Deals", href: "/coupons" },
  { label: "Blog", href: "/blog" },
];

export interface MobileMenuCategory {
  id: string;
  name: string;
  slug: string;
}

interface MobileNavigationClientProps {
  categories: MobileMenuCategory[];
}


export default function MobileNavigationClient({ categories, }: MobileNavigationClientProps) {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <>
      {/* Mobile menu trigger */}
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-navigation-drawer"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)] md:hidden"
        style={{
          borderColor: "var(--border)",
          color: "var(--foreground)",
          backgroundColor: "var(--background)",
        }}
      >
        <Menu size={21} />
      </button>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeMenu}
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 md:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Left sliding drawer */}
      <aside
        id="mobile-navigation-drawer"
        aria-label="Mobile navigation"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-[70] flex w-[min(340px,88vw)] flex-col border-r shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: "var(--background)",
          borderColor: "var(--border)",
          visibility: open ? "visible" : "hidden",
        }}
      >
        {/* Drawer header */}
        <div
          className="flex h-[72px] shrink-0 items-center justify-between border-b px-5"
          style={{ borderColor: "var(--border)" }}
        >
          <Link
            href="/"
            onClick={closeMenu}
            className="font-heading text-xl font-extrabold tracking-tight"
          >
            <span style={{ color: "var(--brand-purple)" }}>Coupons</span>
            <span style={{ color: "var(--brand-yellow)" }}>Next</span>
          </Link>

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[var(--accent-light)]"
            style={{ color: "var(--foreground)" }}
          >
            <X size={21} />
          </button>
        </div>

        {/* Scrollable drawer content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {/* Search */}
          <div className="border-b p-4" style={{ borderColor: "var(--border)" }}>
            <form action="/search" onSubmit={closeMenu} className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted)" }}
              />

              <input
                name="q"
                type="search"
                placeholder="Search stores and deals"
                aria-label="Search stores and deals"
                className="h-11 w-full rounded-xl border bg-transparent pl-10 pr-3 text-sm outline-none focus:border-[var(--brand-purple)]"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
            </form>
          </div>

          {/* Secondary desktop navigation, adapted for mobile */}
          <div className="p-4">
            <button
              type="button"
              aria-expanded={categoriesOpen}
              onClick={() => setCategoriesOpen((value) => !value)}
              className="flex w-full items-center justify-between rounded-xl p-3 text-sm font-bold"
              style={{
                backgroundColor: "var(--accent-light)",
                color: "var(--brand-purple)",
              }}
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "var(--brand-yellow)" }}
                />
                Explore categories
              </span>

              <ChevronDown
                size={17}
                className={`transition-transform duration-200 ${
                  categoriesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {categoriesOpen && (
              <nav aria-label="Browse categories" className="mt-2 space-y-1">
                {categories.length > 0 ? (
                    <nav aria-label="Browse categories" className="mt-2 space-y-1">
                        {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/category/${category.slug}`}
                            onClick={closeMenu}
                            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)]"
                            style={{ color: "var(--foreground)" }}
                        >
                            <span className="min-w-0 truncate line-clamp-1">
                            {category.name}
                            </span>

                            <ChevronRight
                            size={15}
                            className="shrink-0"
                            style={{ color: "var(--muted)" }}
                            />
                        </Link>
                        ))}

                        <Link
                        href="/category"
                        onClick={closeMenu}
                        className="mt-2 flex min-h-11 items-center justify-between rounded-xl border px-3 py-3 text-sm font-bold transition-colors hover:bg-[var(--accent-light)]"
                        style={{
                            borderColor: "var(--border)",
                            color: "var(--brand-purple)",
                        }}
                        >
                        Explore all categories
                        <ArrowRight size={16} />
                        </Link>
                    </nav>
                    ) : (
                    <p className="px-3 py-4 text-sm" style={{ color: "var(--muted)" }}>
                        No categories available.
                    </p>
                )}
              </nav>
            )}
          </div>

          {/* Main navigation */}
          <div
            className="mx-4 border-t py-4"
            style={{ borderColor: "var(--border)" }}
          >
            <p
              className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--muted)" }}
            >
              Navigation
            </p>

            <nav aria-label="Main navigation" className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition-colors hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)]"
                  style={{
                    color:
                      link.href === "/"
                        ? "var(--brand-purple)"
                        : "var(--foreground)",
                  }}
                >
                  {link.label}
                  <ChevronRight
                    size={16}
                    style={{ color: "var(--muted)" }}
                  />
                </Link>
              ))}
            </nav>
          </div>

          {/* Explore CTA */}
          <div className="px-4 pb-5">
            <Link
              href="/coupons"
              onClick={closeMenu}
              className="flex min-h-12 items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-hover)]"
              style={{ backgroundColor: "var(--brand-purple)" }}
            >
              Explore all deals
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        {/* Drawer footer */}
        <div
          className="shrink-0 border-t px-5 py-4"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--background)",
          }}
        >
          <p className="text-xs leading-5" style={{ color: "var(--muted)" }}>
            Discover offers and find your next great saving.
          </p>
        </div>
      </aside>
    </>
  );
}