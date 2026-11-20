
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  TicketPercent,
  Store,
  Tags,
} from "lucide-react";

interface SearchStore {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  type: "store";
  href: string;
}

interface SearchCoupon {
  id: string;
  title: string;
  slug: string;
  type: "code" | "deal";
  code?: string;
  image?: string;
  discount?: string;
  store: {
    name: string;
    slug: string;
    logo?: string;
  };
  typeLabel: "coupon";
  href: string;
}

interface SearchBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  type: "blog";
  href: string;
}

interface SearchCategory {
  id: string;
  name: string;
  slug: string;
  image?: string;
  contentTypes: string[];
  type: "category";
  href: string;
}

type SearchItem =
  | SearchStore
  | SearchCoupon
  | SearchBlog
  | SearchCategory;

interface SearchResultCardProps {
  item: SearchItem;
}

function getImage(item: SearchItem): string | undefined {
  if (item.type === "store") {
    return item.logo;
  }

  if (item.type === "blog") {
    return item.featuredImage;
  }

  if (item.type === "category") {
    return item.image;
  }

  return item.image || item.store.logo;
}

function getTitle(item: SearchItem): string {
  if (item.type === "store" || item.type === "category") {
    return item.name;
  }

  return item.title;
}

function getType(item: SearchItem): string {
  if (item.type === "store") return "Store";
  if (item.type === "blog") return "Article";
  if (item.type === "category") return "Category";

  return "Coupon";
}

function getIcon(item: SearchItem) {
  if (item.type === "store") return Store;
  if (item.type === "blog") return BookOpen;
  if (item.type === "category") return Tags;

  return TicketPercent;
}

export default function SearchResultCard({
  item,
}: SearchResultCardProps) {
  const image = getImage(item);
  const title = getTitle(item);
  const type = getType(item);
  const Icon = getIcon(item);

  return (
    <Link
      href={item.href}
      className="group flex h-full min-w-0 items-center gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--brand-purple)]/40 hover:shadow-[0_12px_35px_rgba(20,20,40,0.07)]"
    >
      {/* Image */}
      <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-gray-50">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="76px"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Icon
            size={27}
            className="text-[var(--brand-purple)]"
          />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-light)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--brand-purple)]">
            <Icon size={11} />
            {type}
          </span>

          {item.type === "code" && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
              Promo code
            </span>
          )}

          {item.type === "deal" && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
              Deal
            </span>
          )}
        </div>

        <h3 className="truncate text-sm font-bold text-[var(--foreground)] transition-colors group-hover:text-[var(--brand-purple)] sm:text-base">
          {title}
        </h3>

        <div className="mt-1.5">
          {item.type === "code" || item.type === "deal" ? (
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
              <span>{item.store.name}</span>

              {item.discount && (
                <>
                  <span className="h-1 w-1 rounded-full bg-gray-300" />
                  <span className="font-semibold text-[var(--brand-purple)]">
                    {item.discount} OFF
                  </span>
                </>
              )}

              {item.code && (
                <>
                  <span className="h-1 w-1 rounded-full bg-gray-300" />
                  <span className="font-medium">
                    Code: {item.code}
                  </span>
                </>
              )}
            </div>
          ) : item.type === "blog" ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
              {item.excerpt}
            </p>
          ) : item.type === "category" ? (
            <p className="text-xs text-[var(--muted)]">
              {item.contentTypes.length > 0
                ? item.contentTypes.join(" · ")
                : "Explore category"}
            </p>
          ) : (
            <p className="text-xs text-[var(--muted)]">
              Explore store and available offers
            </p>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all duration-300 group-hover:bg-[var(--brand-purple)] group-hover:text-white">
        <ArrowUpRight
          size={17}
          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
    </Link>
  );
}
