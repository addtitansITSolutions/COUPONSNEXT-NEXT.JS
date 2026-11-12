
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Tag } from "lucide-react";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
}

interface CategoryCardProps {
  category: CategoryItem;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/coupons?category=${encodeURIComponent(category.slug)}`}
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-4 transition duration-300 hover:-translate-y-1 hover:border-[var(--brand-purple)]/40 hover:shadow-lg hover:shadow-[var(--brand-purple)]/5 sm:p-5"
    >
      <div className="relative mb-4 flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-xl bg-[var(--accent-light)]">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 260px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <Tag
            size={34}
            strokeWidth={1.5}
            className="text-[var(--brand-purple)]"
          />
        )}

        {category.isFeatured && (
          <span className="absolute left-2 top-2 rounded-full bg-[var(--brand-yellow)] px-2.5 py-1 text-[10px] font-bold text-[var(--brand-navy)]">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-[var(--brand-navy)] transition group-hover:text-[var(--brand-purple)] sm:text-base">
            {category.name}
          </h3>

          {category.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)] sm:text-sm">
              {category.description}
            </p>
          )}
        </div>

        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-light)] text-[var(--brand-purple)] transition group-hover:bg-[var(--brand-purple)] group-hover:text-white">
          <ArrowUpRight size={17} />
        </span>
      </div>
    </Link>
  );
}
