import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { connectDB } from "@/lib/mongodb";
import Store from "@/models/Store";

import PublicHeader from "@/components/public/layout/PublicHeader";
import PublicFooter from "@/components/public/layout/PublicFooter";
import StoreHero from "@/components/public/store/StoreHero";

interface StorePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;

  await connectDB();

  const store = await Store.findOne({
    slug,
    isActive: true,
  })
    .select("name slug description logo storeBanner websiteUrl affiliateUrl")
    .lean();

  if (!store) {
    notFound();
  }

  return (
    <>
      <PublicHeader />

      <main>
        <StoreHero
          store={{
            name: store.name,
            slug: store.slug,
            description: store.description ?? "",
            logo: store.logo ?? "",
            storeBanner: store.storeBanner ?? "",
            affiliateUrl: store.affiliateUrl ?? "",
            websiteUrl: store.websiteUrl ?? "",
          }}
        />
      </main>

      <PublicFooter />
    </>
  );
}