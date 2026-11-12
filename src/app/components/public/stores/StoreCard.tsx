
// import Link from "next/link";
// import Image from "next/image";
// import { ArrowUpRight, Store } from "lucide-react";

// import type { StoreItem } from "@/components/public/stores/StoresClient";

// interface StoreCardProps {
//   store: StoreItem;
// }

// export default function StoreCard({ store }: StoreCardProps) {
//   return (
//     <Link
//       href={`/stores/${store.slug}`}
//       className="group relative flex h-full flex-col rounded-2xl border border-gray-200 bg-[var(--accent-light)]/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand-purple)]/40 hover:shadow-xl hover:shadow-purple-900/5"
//     >
//       {/* Featured Badge */}
//       {store.isFeatured && (
//         <div className="absolute right-0 top-0 flex items-stretch">
//           {/* Left S-curve (flipped vertically so it hangs from the top edge) */}
//           <svg
//             className="w-4 shrink-0 self-stretch"
//             viewBox="0 0 100 100"
//             preserveAspectRatio="none"
//             aria-hidden="true"
//           >
//             <path d="M0 0 C 50 0, 5 100, 100 100 V 0 Z" fill="var(--brand-yellow)" />
//           </svg>

//           {/* Text block */}
//           <span className="-ml-px rounded-tr-[15px] bg-[var(--brand-yellow)] py-1.5 pl-1 pr-4 text-[10px] font-bold uppercase tracking-wide text-[var(--brand-navy)]">
//             Featured
//           </span>
//         </div>
//       )}

//       {/* Store Logo */}
//       <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
//         {store.logo ? (
//           <Image
//             src={store.logo}
//             alt={`${store.name} logo`}
//             width={80}
//             height={80}
//             className="h-full w-full object-contain p-2"
//             unoptimized
//           />
//         ) : (
//           <Store size={32} className="text-gray-400" />
//         )}
//       </div>

//       {/* Store Information */}
//       <div className="mt-5 flex flex-1 flex-col">
//         <h3 className="text-base font-bold text-[var(--brand-navy)] transition-colors group-hover:text-[var(--brand-purple)]">
//           {store.name}
//         </h3>

//         {store.category && (
//           <p className="mt-1 text-sm text-gray-500">
//             {store.category.name}
//           </p>
//         )}

//         {store.description && (
//           <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
//             {store.description}
//           </p>
//         )}

//         <div className="mt-auto flex items-center justify-between pt-5">
//           <span className="text-xs font-semibold text-[var(--brand-purple)]">
//             View Store
//           </span>

//           <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-[var(--brand-purple)] transition-all group-hover:bg-[var(--brand-purple)] group-hover:text-white">
//             <ArrowUpRight size={16} />
//           </span>
//         </div>
//       </div>
//     </Link>
//   );
// }




import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Store, Tag } from "lucide-react";

import type { StoreItem } from "@/components/public/stores/StoresClient";

interface StoreCardProps {
  store: StoreItem;
}

export default function StoreCard({ store }: StoreCardProps) {
  const hasBanner = Boolean(store.storeBanner?.trim());
  return (
    <Link
      href={`/stores/${store.slug}`}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-purple-900/10 ${
        store.isFeatured
          ? "border-[var(--brand-yellow)]/70 hover:border-[var(--brand-yellow)] bg-[var(--accent-light)]/20 hover:bg-[var(--brand-yellow)]/20"
          : "border-gray-200 hover:border-[var(--brand-purple)]/40 bg-white hover:bg-[var(--brand-yellow)]/20"
      }`}
    >
      {/* Header banner */}
      <div className="relative h-24 overflow-hidden bg-gradient-to-br from-[var(--brand-purple)]/15 via-[var(--accent-light)] to-[var(--brand-yellow)]/30">
        {hasBanner ? (
          <>
            <Image
              src={store.storeBanner as string}
              alt={`${store.name} banner`}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
            {/* Soft bottom fade so the overlapping logo stands out */}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent" />
          </>
        ) : (
          <>
            {/* Dot pattern */}
            <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.07)_1px,transparent_0)] [background-size:14px_14px]" />
            {/* Soft glow blobs */}
            <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-[var(--brand-yellow)]/30 blur-2xl transition-transform duration-500 group-hover:scale-125" />
            <div className="absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-[var(--brand-purple)]/20 blur-2xl transition-transform duration-500 group-hover:scale-125" />
          </>
        )}
      </div>

      {/* Featured Badge */}
      {store.isFeatured && (
        <div className="absolute right-0 top-0 z-20 flex items-stretch drop-shadow-sm">
          <svg
            className="w-4 shrink-0 self-stretch"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 0 C 50 0, 5 100, 100 100 V 0 Z" fill="var(--brand-yellow)" />
          </svg>

          <span className="-ml-px rounded-tr-[15px] bg-[var(--brand-yellow)] py-1.5 pl-1 pr-4 text-[10px] font-bold uppercase tracking-wide text-[var(--brand-navy)]">
            Featured
          </span>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 flex-col px-5 pb-5">
        {/* Store Logo (overlaps the banner) */}
        <div className="relative z-10 -mt-10 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md ring-1 ring-gray-100 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2">
          {store.logo ? (
            <Image
              src={store.logo}
              alt={`${store.name} logo`}
              width={80}
              height={80}
              className="h-full w-full object-contain p-0.5"
              unoptimized
            />
          ) : (
            <Store size={30} className="text-gray-400" />
          )}
        </div>

        {/* Store Information */}
        <div className="mt-2 flex flex-1 flex-col">
          <h3 className="line-clamp-1 text-lg font-bold text-[var(--brand-navy)] transition-colors group-hover:text-[var(--brand-purple)]">
            {store.name}
          </h3>

          {store.category && (
            <span className="mt-2 inline-flex max-w-full items-center gap-1 rounded-full bg-brand-purple/10 px-2.5 py-1 text-[11px] font-semibold text-brand-purple">
              <Tag size={11} className="shrink-0" />
              <span className="truncate">{store.category.name}</span>
            </span>
          )}

          {store.description && (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
              {store.description}
            </p>
          )}

          {/* Ticket-style footer */}
          <div className="mt-auto flex items-center justify-between border-t border-dashed border-gray-200 pt-4">
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--brand-purple)]">
              View Store
            </span>

            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-[var(--brand-purple)] transition-all duration-300 group-hover:bg-[var(--brand-purple)] group-hover:text-white group-hover:shadow-md group-hover:shadow-purple-500/30">
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}