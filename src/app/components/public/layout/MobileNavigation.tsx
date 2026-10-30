import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import MobileNavigationClient, {
  type MobileMenuCategory,
} from "./MobileNavigationClient";

export default async function MobileNavigation() {
  await connectDB();

  const documents = await Category.find({ isActive: true })
  .sort({ sortOrder: 1, name: 1 })
  .limit(8)
  .select("name slug")
  .lean();

  const categories: MobileMenuCategory[] = documents.map((category) => ({
    id: String(category._id),
    name: category.name,
    slug: category.slug,
  }));

  return <MobileNavigationClient categories={categories} />;
}