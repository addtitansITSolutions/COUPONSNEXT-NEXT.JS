
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BlogBreadcrumbProps {
  title: string;
}

export default function BlogBreadcrumb({
  title,
}: BlogBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b border-[var(--border)] bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <ol className="flex min-w-0 flex-wrap items-center gap-2 text-xs sm:text-sm">

          {/* Home */}
          <li className="flex shrink-0 items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-medium text-[var(--muted)] transition-colors hover:text-[var(--brand-purple)]"
            >
              <Home size={15} />
              <span>Home</span>
            </Link>

            <ChevronRight
              size={14}
              className="text-[var(--muted)]/60"
            />
          </li>

          {/* Blogs */}
          <li className="flex shrink-0 items-center gap-2">
            <Link
              href="/blogs"
              className="font-medium text-[var(--muted)] transition-colors hover:text-[var(--brand-purple)]"
            >
              Blogs
            </Link>

            <ChevronRight
              size={14}
              className="text-[var(--muted)]/60"
            />
          </li>

          {/* Current blog */}
          <li
            aria-current="page"
            className="min-w-0 flex-1 truncate font-semibold text-[var(--brand-navy)]"
          >
            {title}
          </li>
        </ol>
      </div>
    </nav>
  );
}
