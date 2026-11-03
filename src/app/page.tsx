import type { Metadata } from "next";
import PublicHeader from "@/components/public/layout/PublicHeader";
import PublicFooter from "@/components/public/layout/PublicFooter";
import HomeHero from "@/components/public/home/HomeHero";
import FeaturedStores from "@/components/public/home/FeaturedStores";
import DealBannersCarousel from "./components/public/home/DealBannersCarousel";
import FeaturedCategories from "@/components/public/home/FeaturedCategories";
import FeaturedCoupons from "@/components/public/home/FeaturedCoupons";
import HowCouponsNextWorks from "@/components/public/home/HowCouponsNextWorks";
import HomeFinalBanner from "@/components/public/home/HomeFinalBanner";
import PopularCoupons from "@/components/public/home/PopularCoupons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Coupons, Promo Codes & the Latest Deals",
  description:
    "Discover promo codes, exclusive offers and the latest deals from popular stores. Shop smarter and find your next saving with CouponsNext.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Coupons, Promo Codes & the Latest Deals | CouponsNext",
    description:
      "Discover promo codes, exclusive offers and the latest deals from popular stores.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main>
        <HomeHero />
        <DealBannersCarousel />
        <PopularCoupons />
        <FeaturedCategories />
        <FeaturedStores />
        <FeaturedCoupons />
        <HowCouponsNextWorks />
        <HomeFinalBanner />
        
        

        {/* Database-backed homepage sections will be added here. */}
      </main>
      <PublicFooter />
    </>
  );
}
