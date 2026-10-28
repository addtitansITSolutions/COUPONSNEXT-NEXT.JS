import CategoryMegaMenu from "./CategoryMegaMenu";
import HeaderAuthActions from "./HeaderAuthActions";
import Link from "next/link";
import { Search, ChevronDown, ArrowUpRight } from "lucide-react";
import MobileNavigation from "./MobileNavigation";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Stores", href: "/stores" },
  { label: "Coupons", href: "/coupons" },
  { label: "Blog", href: "/blog" },
];

const secondaryNavigation = [
  { label: "All stores", href: "/stores" },
  { label: "Latest coupons", href: "/coupons" },
  { label: "Latest deals", href: "/coupons?type=deal" },
  { label: "Latest articles", href: "/blog" },
];

export default function PublicHeader() {
  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        backgroundColor: "var(--background)",
        borderColor: "var(--border)",
      }}
    >
      {/* Primary header */}
      <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-3 px-4 sm:h-[76px] sm:gap-5 sm:px-6 lg:px-8">
        {/* Mobile menu — left side */}
        <div className="md:hidden">
          <MobileNavigation />
        </div>

        {/* Logo */}
        <Link
          href="/"
          aria-label="CouponsNext homepage"
          className="shrink-0 font-heading text-[20px] font-extrabold tracking-tight sm:text-2xl"
        >
          <span style={{ color: "var(--brand-purple)" }}>Coupons</span>
          <span style={{ color: "var(--brand-yellow)" }}>Next</span>
        </Link>

        {/* Desktop search */}
        <form
          action="/search"
          className="relative hidden max-w-md flex-1 lg:block"
        >
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "var(--muted)" }}
          />
          <input
            name="q"
            type="search"
            placeholder="Search stores, coupons and deals..."
            className="h-11 w-full rounded-xl border pl-11 pr-4 text-sm outline-none transition focus:border-[var(--brand-purple)]"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
            }}
          />
        </form>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="ml-auto hidden items-center gap-5 md:flex lg:gap-6"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-sm font-medium transition-colors hover:text-[var(--brand-purple)]"
              style={{
                color:
                  item.href === "/"
                    ? "var(--brand-purple)"
                    : "var(--foreground)",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Explore deals — right side on mobile and desktop */}
        <HeaderAuthActions />
      </div>


      {/* Secondary navigation — desktop */}
      <div
        className="hidden border-t md:block"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="mx-auto flex h-11 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <CategoryMegaMenu />

          <nav
            aria-label="Quick links"
            className="flex min-w-0 items-center gap-4 lg:gap-6"
          >
            {secondaryNavigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="shrink-0 whitespace-nowrap text-xs font-medium transition-colors hover:text-[var(--brand-purple)]"
                style={{ color: "var(--muted)" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
