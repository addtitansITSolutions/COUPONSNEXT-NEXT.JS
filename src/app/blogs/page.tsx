import { Suspense } from "react";
import type { Metadata } from "next";

import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

import PublicHeader from "@/components/public/layout/PublicHeader";
import PublicFooter from "@/components/public/layout/PublicFooter";

import BlogsHero from "@/components/public/blogs/BlogsHero";
import BlogsClient from "@/components/public/blogs/BlogsClient";

export const metadata: Metadata = {
  title: "Latest Blogs & Shopping Guides | CouponsNext",
  description:
    "Explore shopping guides, money-saving tips, deal insights, and the latest articles from CouponsNext.",
};

export default async function BlogsPage() {
  await connectDB();

  // Fetch active blog categories.
  const categoryDocuments = await Category.find({
    isActive: true,
    contentTypes: "blog",
  })
    .select("name slug")
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  const categories = categoryDocuments.map((category) => ({
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
  }));

  return (
    <>
      <PublicHeader />

      <main>
        <BlogsHero />

        <Suspense
          fallback={
            <div className="min-h-[600px] bg-white" />
          }
        >
          <BlogsClient categories={categories} />
        </Suspense>
      </main>

      <PublicFooter />
    </>
  );
}