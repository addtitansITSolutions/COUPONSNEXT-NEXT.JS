import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Store from "@/models/Store";
import Coupon from "@/models/Coupon";
import Blog from "@/models/Blog";
import Category from "@/models/Category";
// Register referenced models for populate().
import "@/models/User";
const RESULT_LIMIT = 5;
const MAX_QUERY_LENGTH = 100;
function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawQuery = searchParams.get("q") || "";
    const query = rawQuery.trim().slice(0, MAX_QUERY_LENGTH);
    // Minimum search length.
    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        query,
        results: {
          stores: [],
          coupons: [],
          blogs: [],
          categories: [],
        },
        counts: {
          stores: 0,
          coupons: 0,
          blogs: 0,
          categories: 0,
          total: 0,
        },
      });
    }
    await connectDB();
    const regex = new RegExp(escapeRegex(query), "i");
    const now = new Date();
    // Search stores, blogs, and categories first.
    const [stores, blogs, categories] = await Promise.all([
      Store.find({
        isActive: true,
        $or: [
          { name: regex },
          { description: regex },
          { slug: regex },
        ],
      })
        .select("name slug logo")
        .sort({ sortOrder: 1, name: 1 })
        .limit(RESULT_LIMIT)
        .lean(),

      Blog.find({
        status: "published",
        isActive: true,
        publishedAt: { $lte: now },
        $or: [
          { title: regex },
          { excerpt: regex },
          { tags: regex },
        ],
      })
        .select(
          "title slug excerpt featuredImage featuredImageAlt publishedAt"
        )
        .populate({
          path: "author",
          select: "name",
          match: { isActive: true },
        })
        .sort({ publishedAt: -1, _id: -1 })
        .limit(RESULT_LIMIT)
        .lean(),

      Category.find({
        isActive: true,
        $or: [
          { name: regex },
          { description: regex },
          { slug: regex },
        ],
      })
        .select("name slug image contentTypes")
        .sort({ sortOrder: 1, name: 1 })
        .limit(RESULT_LIMIT)
        .lean(),
    ]);

    // Only include blogs with active authors.
    const validBlogs = blogs.filter((blog) => blog.author);
    // Search coupons by title, description, code,
    // and matching active store names.
    const matchingStoreIds = stores.map((store) => store._id);

    const couponConditions: Record<string, unknown>[] = [
      { title: regex },
      { description: regex },
      { code: regex },
    ];

    if (matchingStoreIds.length > 0) {
      couponConditions.push({
        store: { $in: matchingStoreIds },
      });
    }

    const coupons = await Coupon.find({
      status: "published",
      isActive: true,
      $and: [
        {
          $or: [
            { startsAt: { $exists: false } },
            { startsAt: null },
            { startsAt: { $lte: now } },
          ],
        },
        {
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gte: now } },
          ],
        },
        {
          $or: couponConditions,
        },
      ],
    })
      .select(
        "title slug type code image discount store expiresAt"
      )
      .populate({
        path: "store",
        select: "name slug logo isActive",
        match: { isActive: true },
      })
      .sort({ isFeatured: -1, sortOrder: 1, createdAt: -1 })
      .limit(RESULT_LIMIT)
      .lean();

    // Never return coupons belonging to inactive or missing stores.
    const validCoupons = coupons.filter((coupon) => coupon.store);

    const results = {
      stores: stores.map((store) => ({
        id: store._id.toString(),
        name: store.name,
        slug: store.slug,
        logo: store.logo,
        type: "store" as const,
        href: `/stores/${store.slug}`,
      })),

      coupons: validCoupons.map((coupon) => {
        const store = coupon.store as {
          _id: unknown;
          name: string;
          slug: string;
          logo?: string;
        };

        return {
          id: coupon._id.toString(),
          title: coupon.title,
          slug: coupon.slug,
          type: coupon.type,
          code: coupon.code,
          image: coupon.image,
          discount: coupon.discount,
          store: {
            name: store.name,
            slug: store.slug,
            logo: store.logo,
          },
          typeLabel: "coupon" as const,
          href: `/coupons/${coupon.slug}`,
        };
      }),

      blogs: validBlogs.map((blog) => ({
        id: blog._id.toString(),
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        featuredImage: blog.featuredImage,
        featuredImageAlt: blog.featuredImageAlt,
        type: "blog" as const,
        href: `/blogs/${blog.slug}`,
      })),

      categories: categories.map((category) => ({
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        image: category.image,
        contentTypes: category.contentTypes,
        type: "category" as const,
        href: `/categories/${category.slug}`,
      })),
    };

    const counts = {
      stores: results.stores.length,
      coupons: results.coupons.length,
      blogs: results.blogs.length,
      categories: results.categories.length,
      total:
        results.stores.length +
        results.coupons.length +
        results.blogs.length +
        results.categories.length,
    };

    return NextResponse.json({
      success: true,
      query,
      results,
      counts,
    });
  } catch (error) {
    console.error("Public search error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to perform search. Please try again.",
      },
      { status: 500 }
    );
  }
}