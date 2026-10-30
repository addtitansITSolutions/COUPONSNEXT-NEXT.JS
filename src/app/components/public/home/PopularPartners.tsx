import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import PopularPartnersClient, {
  type PopularCouponItem,
} from "./PopularPartnersClient";

export default async function PopularPartners() {
  await connectDB();

  const HOMEPAGE_COUPON_LIMIT = 20;

  const documents = await Coupon.find({
    isActive: true,
    isVerified: true,
    status: "published",
  })
    .sort({ sortOrder: 1, createdAt: -1, _id: 1 })
    .limit(HOMEPAGE_COUPON_LIMIT)
    .populate({
      path: "store",
      select: "name slug logo isActive",
    })
    .select(
      "title slug type code image discount store sortOrder"
    )
    .lean();

  const coupons: PopularCouponItem[] = documents.flatMap((coupon) => {
    const store = coupon.store as unknown as {
      name: string;
      slug: string;
      logo?: string;
      isActive: boolean;
    } | null;

    if (!store || !store.isActive) {
      return [];
    }

    return [
      {
        id: String(coupon._id),
        title: coupon.title,
        slug: coupon.slug,
        type: coupon.type,
        code: coupon.code ?? "",
        image: coupon.image ?? "",
        discount: coupon.discount ?? "",
        store: {
          name: store.name,
          slug: store.slug,
          logo: store.logo ?? "",
        },
      },
    ];
  });

  if (coupons.length === 0) return null;

  return <PopularPartnersClient coupons={coupons} />;
}