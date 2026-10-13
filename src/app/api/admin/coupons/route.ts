import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-guards";
import { createCouponSchema, couponQuerySchema, } from "@/lib/validations/coupon";
import { handleApiError } from "@/lib/errors/handleApiError";
import { ApiError } from "@/lib/errors/ApiError";
import Coupon from "@/models/Coupon";
import Store from "@/models/Store";
import Category from "@/models/Category";
import { Types } from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validation = createCouponSchema.safeParse(body);

    if (!validation.success) {
      throw validation.error;
    }

    const couponData = validation.data;

    await connectDB();

    const store = await Store.findById(couponData.store)
      .select("name slug logo isActive")
      .lean();

    if (!store) {
      throw new ApiError(
        404,
        "The selected store could not be found",
        "STORE_NOT_FOUND"
      );
    }

    if (couponData.status === "published" && !store.isActive) {
      throw new ApiError(
        400,
        "Coupons cannot be published for an inactive store",
        "STORE_INACTIVE"
      );
    }

    if (couponData.category) {
      const category = await Category.findById(couponData.category)
        .select("name slug isActive contentTypes")
        .lean();

      if (!category) {
        throw new ApiError(
          404,
          "The selected category could not be found",
          "CATEGORY_NOT_FOUND"
        );
      }

      if (!category.contentTypes.includes("coupon")) {
        throw new ApiError(
          400,
          "The selected category does not support coupons",
          "INVALID_CATEGORY_TYPE"
        );
      }

      if (couponData.status === "published" && !category.isActive) {
        throw new ApiError(
          400,
          "Coupons cannot be published in an inactive category",
          "CATEGORY_INACTIVE"
        );
      }
    }

    const existingCoupon = await Coupon.exists({
      slug: couponData.slug,
    });

    if (existingCoupon) {
      throw new ApiError(
        409,
        "A coupon with this slug already exists",
        "COUPON_SLUG_EXISTS"
      );
    }

    const coupon = await Coupon.create({
      ...couponData,
      // Deal coupons must not have a coupon code.
      ...(couponData.type === "deal" ? { code: undefined } : {}),
    });

    await coupon.populate([
      {
        path: "store",
        select: "name slug logo storeBanner isActive",
      },
      {
        path: "category",
        select: "name slug",
      },
    ]);

    const populatedCoupon = coupon.toObject();

    return NextResponse.json(
      {
        success: true,
        message: "Coupon created successfully",
        coupon: {
          id: populatedCoupon._id.toString(),
          title: populatedCoupon.title,
          slug: populatedCoupon.slug,
          description: populatedCoupon.description,
          type: populatedCoupon.type,
          code: populatedCoupon.code,
          image: populatedCoupon.image,
          store: populatedCoupon.store
            ? {
                id: (populatedCoupon.store as unknown as {
                  _id: Types.ObjectId;
                  name: string;
                  slug: string;
                  logo: string;
                  storeBanner: string;
                  isActive: boolean;
                })._id.toString(),
                name: (populatedCoupon.store as unknown as {
                  name: string;
                }).name,
                slug: (populatedCoupon.store as unknown as {
                  slug: string;
                }).slug,
                logo: (populatedCoupon.store as unknown as {
                  logo: string;
                }).logo,
                storeBanner: (populatedCoupon.store as unknown as {
                  storeBanner: string;
                }).storeBanner,
                isActive: (populatedCoupon.store as unknown as {
                  isActive: boolean;
                }).isActive,
              }
            : null,
          category: populatedCoupon.category
            ? {
                id: (populatedCoupon.category as unknown as {
                  _id: Types.ObjectId;
                  name: string;
                  slug: string;
                })._id.toString(),
                name: (populatedCoupon.category as unknown as {
                  name: string;
                }).name,
                slug: (populatedCoupon.category as unknown as {
                  slug: string;
                }).slug,
              }
            : null,
          discount: populatedCoupon.discount,
          affiliateUrl: populatedCoupon.affiliateUrl,
          country: populatedCoupon.country,
          startsAt: populatedCoupon.startsAt,
          expiresAt: populatedCoupon.expiresAt,
          status: populatedCoupon.status,
          isActive: populatedCoupon.isActive,
          isFeatured: populatedCoupon.isFeatured,
          isVerified: populatedCoupon.isVerified,
          sortOrder: populatedCoupon.sortOrder,
          createdAt: populatedCoupon.createdAt,
          updatedAt: populatedCoupon.updatedAt,
        },
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return handleApiError(
        new ApiError(
          409,
          "A coupon with this slug already exists",
          "COUPON_SLUG_EXISTS"
        ),
        request
      );
    }

    return handleApiError(error, request);
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);

    const query = couponQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );

    if (!query.success) {
      throw query.error;
    }

    const {
      page,
      limit,
      search,
      store,
      category,
      type,
      status,
      country,
      isActive,
      isFeatured,
      isVerified,
    } = query.data;

    await connectDB();

    const filter: Record<string, unknown> = {};

    if (search) {
      const searchRegex = {
        $regex: escapeRegex(search),
        $options: "i",
      };

      filter.$or = [
        { title: searchRegex },
        { slug: searchRegex },
        { description: searchRegex },
        { code: searchRegex },
        { discount: searchRegex },
      ];
    }

    if (store) {
      filter.store = new Types.ObjectId(store);
    }

    if (category) {
      filter.category = new Types.ObjectId(category);
    }

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    if (country) {
      filter.country = country;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }

    if (isVerified !== undefined) {
      filter.isVerified = isVerified;
    }

    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      Coupon.find(filter)
        .select(
          "title slug description type code image store category discount affiliateUrl country startsAt expiresAt status isActive isFeatured isVerified sortOrder createdAt updatedAt"
        )
        .sort({
          sortOrder: 1,
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit)
        .populate("store", "name slug logo storeBanner isActive")
        .populate("category", "name slug")
        .lean(),

      Coupon.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        coupons: coupons.map((coupon) => {
          const populatedStore = coupon.store as unknown as {
            _id: Types.ObjectId;
            name: string;
            slug: string;
            logo: string;
            storeBanner: string;
            isActive: boolean;
          } | null;

          const populatedCategory = coupon.category as unknown as {
            _id: Types.ObjectId;
            name: string;
            slug: string;
          } | null;

          return {
            id: coupon._id.toString(),
            title: coupon.title,
            slug: coupon.slug,
            description: coupon.description,
            type: coupon.type,
            code: coupon.code,
            image: coupon.image,
            store: populatedStore
              ? {
                  id: populatedStore._id.toString(),
                  name: populatedStore.name,
                  slug: populatedStore.slug,
                  logo: populatedStore.logo,
                  storeBanner: populatedStore.storeBanner,
                  isActive: populatedStore.isActive,
                }
              : null,
            category: populatedCategory
              ? {
                  id: populatedCategory._id.toString(),
                  name: populatedCategory.name,
                  slug: populatedCategory.slug,
                }
              : null,
            discount: coupon.discount,
            affiliateUrl: coupon.affiliateUrl,
            country: coupon.country,
            startsAt: coupon.startsAt,
            expiresAt: coupon.expiresAt,
            status: coupon.status,
            isActive: coupon.isActive,
            isFeatured: coupon.isFeatured,
            isVerified: coupon.isVerified,
            sortOrder: coupon.sortOrder,
            createdAt: coupon.createdAt,
            updatedAt: coupon.updatedAt,
          };
        }),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}
