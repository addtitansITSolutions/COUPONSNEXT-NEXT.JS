
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Store } from "lucide-react";

import type { StoreItem } from "@/components/public/stores/StoresClient";

interface StoreCardProps {
  store: StoreItem;
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <Link
      href={`/stores/${store.slug}`}
      className="group relative flex h-full flex-col rounded-2xl border border-gray-200 bg-[var(--accent-light)]/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand-purple)]/40 hover:shadow-xl hover:shadow-purple-900/5"
    >
      {/* Featured Badge */}
      {store.isFeatured && (
        <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-[var(--brand-yellow)]/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--brand-navy)]">
          Featured
        </span>
      )}

      {/* Store Logo */}
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
        {store.logo ? (
          <Image
            src={store.logo}
            alt={`${store.name} logo`}
            width={80}
            height={80}
            className="h-full w-full object-contain p-2"
            unoptimized
          />
        ) : (
          <Store size={32} className="text-gray-400" />
        )}
      </div>

      {/* Store Information */}
      <div className="mt-5 flex flex-1 flex-col">
        <h3 className="text-base font-bold text-[var(--brand-navy)] transition-colors group-hover:text-[var(--brand-purple)]">
          {store.name}
        </h3>

        {store.category && (
          <p className="mt-1 text-sm text-gray-500">
            {store.category.name}
          </p>
        )}

        {store.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
            {store.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-xs font-semibold text-[var(--brand-purple)]">
            View Store
          </span>

          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-[var(--brand-purple)] transition-all group-hover:bg-[var(--brand-purple)] group-hover:text-white">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
