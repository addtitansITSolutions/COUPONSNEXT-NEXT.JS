
import { Suspense } from "react";
import type { Metadata } from "next";

import PublicHeader from "@/components/public/layout/PublicHeader";
import PublicFooter from "@/components/public/layout/PublicFooter";
import StoresClient from "@/components/public/stores/StoresClient";

export const metadata: Metadata = {
  title: "Browse Stores & Find the Best Deals | CouponsNext",
  description:
    "Explore popular stores, discover your favorite brands, and find the latest coupons and deals on CouponsNext.",
};

export default function StoresPage() {
  return (
    <>
      <PublicHeader />

      <main>
        <Suspense
          fallback={
            <div className="min-h-[500px] animate-pulse bg-gray-50" />
          }
        >
          <StoresClient />
        </Suspense>
      </main>

      <PublicFooter />
    </>
  );
}
