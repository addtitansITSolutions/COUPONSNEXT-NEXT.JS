import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import FeaturedCouponsClient, {
  type FeaturedCouponItem,
} from "./FeaturedCouponsClient";

export default async function FeaturedCoupons() {
  await connectDB();

  const HOMEPAGE_COUPON_LIMIT = 8;

  const documents = await Coupon.find({
    isActive: true,
    isFeatured: true,
    status: "published",
  })
    .sort({ sortOrder: 1, createdAt: -1, _id: 1 })
    .limit(HOMEPAGE_COUPON_LIMIT)
    .populate({
      path: "store",
      select: "name slug logo isActive",
    })
    .select(
      "title slug description type code image store discount affiliateUrl sortOrder"
    )
    .lean();

  const coupons: FeaturedCouponItem[] = documents.flatMap((coupon) => {
    const store = coupon.store as unknown as {
      _id: unknown;
      name: string;
      slug: string;
      logo?: string;
      isActive: boolean;
    } | null;

    // Do not show coupons whose store is missing or inactive.
    if (!store || !store.isActive) {
      return [];
    }

    return [
      {
        id: String(coupon._id),
        title: coupon.title,
        slug: coupon.slug,
        description: coupon.description ?? "",
        type: coupon.type,
        code: coupon.code ?? "",
        image: coupon.image ?? "",
        discount: coupon.discount ?? "",
        affiliateUrl: coupon.affiliateUrl,
        store: {
          name: store.name,
          slug: store.slug,
          logo: store.logo ?? "",
        },
      },
    ];
  });

  if (coupons.length === 0) return null;

  return <FeaturedCouponsClient coupons={coupons} />;
}