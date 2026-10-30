import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export interface StoreHeroProps {
  store: {
    name: string;
    slug: string;
    description: string;
    logo: string;
    storeBanner: string;
    affiliateUrl: string;
    websiteUrl: string;
  };
}

export default function StoreHero({ store }: StoreHeroProps) {
  return (
    <section className="w-full">
      {/* Full-width banner */}
      <div
        className="relative flex min-h-[280px] w-full items-center overflow-hidden bg-[var(--brand-navy)] bg-cover bg-center sm:min-h-[340px] lg:min-h-[400px]"
        style={
          store.storeBanner
            ? {
                backgroundImage: `url("${store.storeBanner}")`,
              }
            : undefined
        }
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/20" />

        {/* Centered content */}
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-start gap-5 px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">

          {/* Store logo */}
          {store.logo && (
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white p-2 sm:h-20 sm:w-20">
              <Image
                src={store.logo}
                alt={`${store.name} logo`}
                width={80}
                height={80}
                className="h-full w-full object-contain"
              />
            </div>
          )}

          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.15em] text-[var(--brand-yellow)]">
              Exclusive offers and deals
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {store.name}
            </h1>

            {store.description && (
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
                {store.description}
              </p>
            )}
          </div>

          {/* Visit store button */}
          {store.affiliateUrl && (
            <Link
              href={store.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)]"
              style={{
                backgroundColor: "var(--brand-purple)",
              }}
            >
              Visit Store
              <ExternalLink size={17} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}