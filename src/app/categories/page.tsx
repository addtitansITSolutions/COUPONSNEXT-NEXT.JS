
import { Suspense } from "react";
import type { Metadata } from "next";

import CategoriesHero from "@/components/public/categories/CategoriesHero";
import CategoriesClient from "@/components/public/categories/CategoriesClient";
import PublicHeader from "@/components/public/layout/PublicHeader";
import PublicFooter from "@/components/public/layout/PublicFooter";

export const metadata: Metadata = {
  title: "Explore Shopping Categories | CouponsNext",
  description:
    "Explore shopping categories on CouponsNext and discover verified coupon codes, exclusive deals, and discounts across your favorite stores.",
};

export default function CategoriesPage() {
  return (
    <>
    <PublicHeader />
      <main>
        <CategoriesHero />

        <Suspense fallback={<div className="min-h-[700px] bg-white" />}>
            <CategoriesClient />
        </Suspense>
      </main>
      <PublicFooter />
    </>
  );
}
