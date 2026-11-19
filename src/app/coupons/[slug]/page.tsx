import type { Metadata } from "next";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import Store from "@/models/Store";
import PublicHeader from "@/components/public/layout/PublicHeader";
import PublicFooter from "@/components/public/layout/PublicFooter";
import CouponBreadcrumb from "@/components/public/coupon/CouponBreadcrumb";
import CouponDetails from "@/components/public/coupon/CouponDetails";
import CouponInformation from "@/components/public/coupon/CouponInformation";
import CouponRelated from "@/components/public/coupon/CouponRelated";

import type { CouponItem } from "@/components/public/coupons/CouponCard";

interface CouponPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface PopulatedStore {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  logo?: string;
  isActive: boolean;
}

interface PopulatedCategory {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
}

interface PopulatedCoupon {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  type: "code" | "deal";
  code?: string;
  image?: string;
  discount?: string;
  affiliateUrl: string;
  country?: string;
  isVerified: boolean;
  isFeatured: boolean;
  startsAt?: Date;
  expiresAt?: Date;
  store: PopulatedStore;
  category?: PopulatedCategory | null;
}

// Convert MongoDB document into the existing CouponItem shape.
function serializeCoupon(coupon: any): CouponItem {
  return {
    id: coupon._id.toString(),
    title: coupon.title,
    slug: coupon.slug,
    description: coupon.description || "",
    type: coupon.type,
    code: coupon.code || "",
    image: coupon.image || "",
    discount: coupon.discount || "",
    affiliateUrl: coupon.affiliateUrl,
    isVerified: coupon.isVerified,
    isFeatured: coupon.isFeatured,
    country: coupon.country || "",
    startsAt: coupon.startsAt
      ? new Date(coupon.startsAt).toISOString()
      : null,
    expiresAt: coupon.expiresAt
      ? new Date(coupon.expiresAt).toISOString()
      : null,
    store: {
      name: coupon.store.name,
      slug: coupon.store.slug,
      logo: coupon.store.logo || "",
    },
    category: coupon.category
      ? {
          name: coupon.category.name,
          slug: coupon.category.slug,
        }
      : null,
  };
}

// Dynamic SEO metadata.
export async function generateMetadata({
  params,
}: CouponPageProps): Promise<Metadata> {
  const { slug } = await params;

  await connectDB();

  const coupon = await Coupon.findOne({
    slug,
    isActive: true,
    status: "published",
  })
    .populate({
      path: "store",
      select: "name slug isActive",
      match: { isActive: true },
    })
    .select("title description image discount store")
    .lean();

  if (!coupon || !coupon.store) {
    return {
      title: "Coupon Not Found | CouponsNext",
    };
  }

  const title = `${coupon.title} | CouponsNext`;
  const description =
    coupon.description ||
    `Discover this ${coupon.discount || ""} offer from ${coupon.store.name} on CouponsNext.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/coupons/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: coupon.image ? [{ url: coupon.image }] : [],
    },
    twitter: {
      card: coupon.image ? "summary_large_image" : "summary",
      title,
      description,
      images: coupon.image ? [coupon.image] : [],
    },
  };
}

export default async function CouponPage({ params, }: CouponPageProps) {
  const { slug } = await params;

  await connectDB();

  // Fetch the published and active coupon.
  const couponDocument = await Coupon.findOne({
    slug,
    isActive: true,
    status: "published",
  })
    .populate({
      path: "store",
      select: "name slug logo isActive",
      match: { isActive: true },
    })
    .populate({
      path: "category",
      select: "name slug",
      match: { isActive: true },
    })
    .lean();

  if (!couponDocument || !couponDocument.store) {
    notFound();
  }

  const coupon = couponDocument as unknown as PopulatedCoupon;

  // Fetch related coupons from the same store.
  const relatedDocuments = await Coupon.find({
    _id: { $ne: coupon._id },
    store: coupon.store._id,
    isActive: true,
    status: "published",
  })
    .populate({
      path: "store",
      select: "name slug logo isActive",
      match: { isActive: true },
    })
    .populate({
      path: "category",
      select: "name slug",
      match: { isActive: true },
    })
    .sort({
      isFeatured: -1,
      sortOrder: 1,
      createdAt: -1,
    })
    .limit(8)
    .lean();

  // Remove related coupons whose stores are no longer active.
  const relatedCoupons = relatedDocuments
    .filter((item) => item.store)
    .map((item) => serializeCoupon(item));

  const couponData = serializeCoupon(coupon);

  return (
    <>
      <PublicHeader />

      <main className="min-h-screen bg-[var(--background)]">
        <CouponBreadcrumb
          couponTitle={coupon.title}
          storeName={coupon.store.name}
          storeSlug={coupon.store.slug}
        />

        
        <section className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-3 lg:gap-8 lg:px-8 lg:py-14">
            {/* Coupon Details - 2 columns */}
            <div className="w-full min-w-0 lg:col-span-2">
                <CouponDetails coupon={couponData} />
            </div>

            {/* Coupon Information - 1 column */}
            <aside className="w-full min-w-0 lg:col-span-1">
                <CouponInformation coupon={couponData} />
            </aside>
        </section>


        <CouponRelated
          coupons={relatedCoupons}
          storeSlug={coupon.store.slug}
        />
      </main>

      <PublicFooter />
    </>
  );
}