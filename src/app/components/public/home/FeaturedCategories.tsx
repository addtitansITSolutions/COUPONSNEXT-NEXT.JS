import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import FeaturedCategoriesClient, { type FeaturedCategoryItem, } from "./FeaturedCategoriesClient";

export default async function FeaturedCategories() {
  await connectDB();

  const documents = await Category.find({
    isActive: true,
    isFeatured: true,
  })
    .sort({ sortOrder: 1, createdAt: -1, _id: 1 })
    .limit(12)
    .select("name slug description image contentTypes sortOrder")
    .lean();

  const categories: FeaturedCategoryItem[] = documents.map((category) => ({
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    image: category.image ?? "",
    contentTypes: category.contentTypes ?? [],
  }));

  if (categories.length === 0) return null;

  return <FeaturedCategoriesClient categories={categories} />;
}
