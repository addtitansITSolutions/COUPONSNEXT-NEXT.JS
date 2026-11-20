
import type { Metadata } from "next";

import PublicHeader from "@/components/public/layout/PublicHeader";
import PublicFooter from "@/components/public/layout/PublicFooter";
import CategoriesHero from "@/components/public/categories/CategoriesHero";
import CategoryStoresSection from "@/components/public/category/CategoryStoresSection";
import CategoryCouponsSection from "@/components/public/category/CategoryCouponsSection";
import CategoryBlogsSection from "@/components/public/category/CategoryBlogsSection";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `${slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")} | CouponsNext`,
    description: `Explore stores, coupon codes, and exclusive deals in this category on CouponsNext.`,
  };
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  const categoryName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <>
      <PublicHeader />

      <main>
        {/* Category Hero */}
        <CategoriesHero />

        {/* Related Stores */}
        <CategoryStoresSection
          categorySlug={slug}
          categoryName={categoryName}
        />


        {/* Related Coupons */}
        <CategoryCouponsSection
            categorySlug={slug}
            categoryName={categoryName}
        />


        {/* Related Blogs */}
        <CategoryBlogsSection
          categorySlug={slug}
          categoryName={categoryName}
        />

        {/* Related Coupons will go here next */}
      </main>

      <PublicFooter />
    </>
  );
}
