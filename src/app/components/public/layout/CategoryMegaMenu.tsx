import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import CategoryMegaMenuClient, {
  type MegaMenuCategory,
} from "./CategoryMegaMenuClient";

export default async function CategoryMegaMenu() {
  await connectDB();

  const documents = await Category.find({
    isActive: true,
  })
    .sort({ sortOrder: 1, name: 1 })
    .select("name slug description sortOrder")
    .lean();

  const categories: MegaMenuCategory[] = documents.map((category) => ({
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
  }));

  if (categories.length === 0) return null;

  return <CategoryMegaMenuClient categories={categories} />;
}