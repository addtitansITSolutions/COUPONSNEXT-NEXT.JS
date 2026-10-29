"use client";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface DealBanner {
  id: string;
  title: string;
  slug: string; // Destination URL slug (e.g., "flipkart-diwali-sale")
  image: string;
}

interface DealBannersCarouselProps {
  banners?: DealBanner[];
}

// Sample fallback banner data matching your image layout
const defaultBanners: DealBanner[] = [
  {
    id: "1",
    title: "Flipkart Big Bang Diwali - 50-90% Off",
    slug: "stores/flipkart",
    image: "/flipkart-deals.png",
  },
  {
    id: "2",
    title: "Amazon Great Indian Festival - Upto 80% Off",
    slug: "stores/amazon",
    image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    title: "Myntra Festive Dhamaka Sale - 50-80% Off",
    slug: "stores/myntra",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "4",
    title: "Ajio Big Bold Sale - Min 50% Off",
    slug: "stores/ajio",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
  },
];

export default function DealBannersCarousel({ banners = defaultBanners, }: DealBannersCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  if (!banners || banners.length === 0) return null;

  return (
    <section className="relative w-full py-4">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Buttons */}
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Previous banners"
          className="absolute -left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-all hover:bg-gray-50 active:scale-95 sm:left-2 md:h-11 md:w-11"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>

        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Next banners"
          className="absolute -right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-all hover:bg-gray-50 active:scale-95 sm:right-2 md:h-11 md:w-11"
        >
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </button>

        {/* Horizontal Banner Track */}
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
        >
          {banners.map((banner) => (
            <Link
                key={banner.id}
                href={`/${banner.slug}`}
                className="group relative h-[200px] w-[320px] shrink-0 snap-start overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition-transform duration-300 hover:scale-[1.01]"
                >
                <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    sizes="360px" // Fixed render size hints Next.js image loader
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}