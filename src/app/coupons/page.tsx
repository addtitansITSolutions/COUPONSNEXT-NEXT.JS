
import { Suspense } from "react";
import type { Metadata } from "next";

import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

import CouponsClient from "@/components/public/coupons/CouponsClient";

import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import PublicHeader from "@/components/public/layout/PublicHeader";
import PublicFooter from "@/components/public/layout/PublicFooter";
import CouponsHero from "@/components/public/coupons/CouponsHero";

export const metadata: Metadata = {
  title: "Latest Coupons & Deals | CouponsNext",
  description:
    "Discover the latest coupon codes, deals, and exclusive offers from your favorite stores on CouponsNext.",
};

countries.registerLocale(en);

export default async function CouponsPage() {
  await connectDB();

  // Fetch active coupon categories.
  const categoryDocuments = await Category.find({
    isActive: true,
    contentTypes: "coupon",
  })
    .select("name slug")
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  const categories = categoryDocuments.map((category) => ({
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
  }));

  // Prepare country filter options.
  const countryNames = countries.getNames("en", {
    select: "official",
  });

  const countryOptions = Object.entries(countryNames)
    .filter(([code]) => /^[A-Z]{2}$/.test(code))
    .map(([code, name]) => ({
      code,
      name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
        <PublicHeader />
            <main>
                <CouponsHero />
                <Suspense
                    fallback={
                        <div className="min-h-[600px] bg-white" />
                    }
                    >
                    <CouponsClient
                        categories={categories}
                        countries={countryOptions}
                    />
                </Suspense>
            </main>
        <PublicFooter />    
    </>
  );
}
