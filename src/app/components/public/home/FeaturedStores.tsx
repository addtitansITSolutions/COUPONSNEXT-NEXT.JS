import { connectDB } from "@/lib/mongodb";
import Store from "@/models/Store";
import FeaturedStoresClient, {
  type FeaturedStoreItem,
} from "./FeaturedStoresClient";

export default async function FeaturedStores() {
  await connectDB();

  const HOMEPAGE_STORE_LIMIT = 8;

  const documents = await Store.find({
    isActive: true,
    isFeatured: true,
  })
    .sort({ sortOrder: 1, createdAt: -1, _id: 1 })
    .limit(HOMEPAGE_STORE_LIMIT)
    .populate({
      path: "category",
      select: "name",
    })
    .select(
      "name slug description logo websiteUrl affiliateUrl category sortOrder"
    )
    .lean();

  const stores: FeaturedStoreItem[] = documents.map((store) => {
    const category = store.category as unknown as
      | { name?: string }
      | null;

    return {
      id: String(store._id),
      name: store.name,
      slug: store.slug,
      description: store.description ?? "",
      logo: store.logo ?? "",
      websiteUrl: store.websiteUrl ?? "",
      affiliateUrl: store.affiliateUrl ?? "",
      category: category?.name ?? "Featured Store",
    };
  });

  if (stores.length === 0) return null;

  return <FeaturedStoresClient stores={stores} />;
}
