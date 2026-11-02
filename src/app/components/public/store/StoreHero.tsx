// import Image from "next/image";
// import Link from "next/link";
// import { ExternalLink } from "lucide-react";

// export interface StoreHeroProps {
//   store: {
//     name: string;
//     slug: string;
//     description: string;
//     logo: string;
//     storeBanner: string;
//     affiliateUrl: string;
//     websiteUrl: string;
//   };
// }

// export default function StoreHero({ store }: StoreHeroProps) {
//   return (
//     <section className="w-full">
//       {/* Full-width banner */}
//       <div
//         className="relative flex min-h-[280px] w-full items-center overflow-hidden bg-[var(--brand-navy)] bg-cover bg-center sm:min-h-[340px] lg:min-h-[400px]"
//         style={
//           store.storeBanner
//             ? {
//                 backgroundImage: `url("${store.storeBanner}")`,
//               }
//             : undefined
//         }
//       >
//         {/* Dark overlay */}
//         <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/20" />

//         {/* Centered content */}
//         <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-start gap-5 px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">

//           {/* Store logo */}
//           {store.logo && (
//             <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white p-2 sm:h-20 sm:w-20">
//               <Image
//                 src={store.logo}
//                 alt={`${store.name} logo`}
//                 width={80}
//                 height={80}
//                 className="h-full w-full object-contain"
//               />
//             </div>
//           )}

//           <div className="max-w-2xl">
//             <p className="mb-2 text-sm font-bold uppercase tracking-[0.15em] text-[var(--brand-yellow)]">
//               Exclusive offers and deals
//             </p>

//             <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
//               {store.name}
//             </h1>

//             {store.description && (
//               <p className="mt-3 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
//                 {store.description}
//               </p>
//             )}
//           </div>

//           {/* Visit store button */}
//           {store.affiliateUrl && (
//             <Link
//               href={store.affiliateUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex min-h-12 items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)]"
//               style={{
//                 backgroundColor: "var(--brand-purple)",
//               }}
//             >
//               Visit Store
//               <ExternalLink size={17} />
//             </Link>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }



import Image from "next/image";
import Link from "next/link";
import StoreDescription from "./StoreDescription";

interface StoreHeroProps {
  store: {
    name: string;
    slug: string;
    logo: string;
    description: string;
    storeBanner: string;
    affiliateUrl: string;
    websiteUrl: string;
  };
}

export default function StoreHero({ store }: StoreHeroProps) {
  const visitUrl = store.affiliateUrl || store.websiteUrl;

  return (
    <div className="flex w-full flex-col gap-[1px] bg-[var(--brand-navy)]">
    <section className="relative w-full">
      {/* Store Banner */}
      <div
        className="relative h-[260px] w-full bg-[var(--brand-navy)] bg-cover bg-center sm:h-[340px] lg:h-[620px]"
        style={
          store.storeBanner
            ? { backgroundImage: `url("${store.storeBanner}")` }
            : undefined
        }
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Yellow S-Curve Layer */}
      <div className="absolute inset-x-0 bottom-0 z-10 h-[105px] sm:h-[120px] [--cap:clamp(56px,14vw,200px)]">
        {/* Solid 20px base: this is the height at the far left/right edges */}
        {/* <div className="absolute inset-x-0 bottom-0 h-[20px] bg-[var(--brand-yellow)]" /> */}

        {/* Curve caps + plateau */}
        <div className="absolute inset-x-0 bottom-[0px] top-0 flex" aria-hidden="true">
          {/* Left S-curve: flat at the edge, rises, flattens at the top */}
          <svg
            className="h-full w-[var(--cap)] shrink-0"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 C 50 100, 5 0, 100 0 V 100 Z" fill="var(--brand-yellow)" />
          </svg>

          {/* Flat center */}
          <div className="-mx-px flex-1 bg-[var(--brand-yellow)]" />

          {/* Right S-curve (mirror) */}
          <svg
            className="h-full w-[var(--cap)] shrink-0"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M 0 0 C 95 0, 50 100, 100 100 H 0 Z" fill="var(--brand-yellow)" />
          </svg>
        </div>

        {/* Store Information (kept inside the flat yellow area) */}
        <div className="absolute inset-0 px-[var(--cap)]">
          <div className="mx-auto flex h-full max-w-4xl items-center justify-between gap-3 pt-3 sm:gap-5">
            {/* Logo and Store Name */}
            <div className="flex min-w-0 items-center gap-3 sm:gap-5">
              {store.logo && (
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-white p-1.5 sm:h-16 sm:w-16">
                  <Image
                    src={store.logo}
                    alt={`${store.name} logo`}
                    fill
                    sizes="64px"
                    className="object-contain p-1.5"
                  />
                </div>
              )}
              <h1 className="truncate text-lg font-bold text-[var(--brand-navy)] sm:text-2xl lg:text-3xl">
                {store.name}
              </h1>
            </div>

            {/* Visit Store Button */}
            {visitUrl && (
              <Link
                href={visitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[var(--brand-navy)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] sm:px-6 sm:py-3 sm:text-base"
              >
                Visit Store
              </Link>
            )}
          </div>
        </div>
      </div>

      
    </section>
    <StoreDescription
        name={store.name}
        description={store.description}
      />
    </div>
  );
}
