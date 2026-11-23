
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationItem {
  label: string;
  href: string;
}

interface ActiveNavigationProps {
  items: NavigationItem[];
  ariaLabel: string;
  secondary?: boolean;
}

export default function ActiveNavigation({
  items,
  ariaLabel,
  secondary = false,
}: ActiveNavigationProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      aria-label={ariaLabel}
      className={
        secondary
          ? "flex min-w-0 shrink-0 items-center gap-4 lg:gap-6"
          : "hidden items-center gap-5 md:flex lg:gap-6"
      }
    >
      {items.map((item) => {
        const active = isActive(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              secondary
                ? "shrink-0 whitespace-nowrap text-xs font-medium transition-colors hover:text-[var(--brand-purple)]"
                : "whitespace-nowrap text-sm font-medium transition-colors hover:text-[var(--brand-purple)]"
            }
            style={{
              color: active
                ? "var(--brand-purple)"
                : secondary
                  ? "var(--muted)"
                  : "var(--foreground)",
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
