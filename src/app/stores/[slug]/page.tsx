import { notFound } from "next/navigation";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

import { connectDB } from "@/lib/mongodb";
import Store from "@/models/Store";
import Category from "@/models/Category";

import PublicHeader from "@/components/public/layout/PublicHeader";
import PublicFooter from "@/components/public/layout/PublicFooter";
import StoreHero from "@/components/public/store/StoreHero";
import StoreCoupons from "@/components/public/store/StoreCoupons";

// Register English country names.
countries.registerLocale(enLocale);

interface StorePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;

  await connectDB();

  // Fetch active store.
  const store = await Store.findOne({
    slug,
    isActive: true,
  })
    .select("name slug description logo storeBanner websiteUrl affiliateUrl")
    .lean();

  if (!store) {
    notFound();
  }

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

  // Generate all countries with their ISO two-letter codes.
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

        <StoreCoupons
          storeId={store._id.toString()}
          categories={categories}
          countries={countryOptions}
        />
      </main>

      <PublicFooter />
    </>
  );
}
