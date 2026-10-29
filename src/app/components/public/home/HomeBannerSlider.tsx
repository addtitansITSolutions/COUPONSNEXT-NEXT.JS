import { connectDB } from "@/lib/mongodb";
import Banner from "@/models/Banner";
import Store from "@/models/Store";
import BannerSliderClient, {
  type HomeBanner,
} from "./BannerSliderClient";

export default async function HomeBannerSlider() {
  await connectDB();

  const documents = await Banner.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .populate({
      path: "store",
      select: "name",
    })
    .lean();

  const banners: HomeBanner[] = documents.map((item) => {
    const store = item.store as unknown as { name?: string } | null;

    return {
      id: String(item._id),
      title: item.title,
      subtitle: item.subtitle ?? "",
      desktopImage: item.desktopImage,
      mobileImage: item.mobileImage,
      affiliateUrl: item.affiliateUrl,
      storeName: store?.name ?? "",
    };
  });

  if (banners.length === 0) return null;

  return <BannerSliderClient banners={banners} />;
}
