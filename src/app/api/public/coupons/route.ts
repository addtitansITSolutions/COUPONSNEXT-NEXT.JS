import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { handleApiError } from "@/lib/errors/handleApiError";
import { ApiError } from "@/lib/errors/ApiError";
import Coupon, { type ICoupon } from "@/models/Coupon";
import Store from "@/models/Store";
import Category from "@/models/Category";                  //reference for population of category field in coupon model
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const publicCouponQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),

  search: z.string().trim().max(100).optional(),

  store: z
    .string()
    .trim()
    .refine((value) => Types.ObjectId.isValid(value), {
      message: "Invalid store ID.",
    })
    .optional(),

  category: z
    .string()
    .trim()
    .refine((value) => Types.ObjectId.isValid(value), {
      message: "Invalid category ID.",
    })
    .optional(),

  type: z.enum(["code", "deal"]).optional(),

  country: z
    .string()
    .trim()
    .regex(/^[a-zA-Z]{2}$/, "Invalid country code.")
    .transform((value) => value.toUpperCase())
    .optional(),

  isVerified: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

   isFeatured: z
  .enum(["true", "false"])
  .optional()
  .transform((value) =>
    value === undefined ? undefined : value === "true"
  ), 

  sort: z
    .enum(["latest", "oldest", "popular"])
    .default("popular"),
});

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const sortOptions = {
  latest: {
    createdAt: -1,
    _id: -1,
  },
  oldest: {
    createdAt: 1,
    _id: 1,
  },
  popular: {
    sortOrder: 1,
    createdAt: -1,
    _id: -1,
  },
} as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryResult = publicCouponQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );
    if (!queryResult.success) {
      throw queryResult.error;
    }
    const { page, limit, search, store, category, type, country, isFeatured, isVerified, sort} = queryResult.data;
    await connectDB();
    const filter: Record<string, unknown> = {
        isActive: true,
        status: "published",
    };
    // Store filter
    if (store) {
      const activeStore = await Store.exists({
        _id: new Types.ObjectId(store),
        isActive: true,
      });
      if (!activeStore) {
        return NextResponse.json(
          {
            success: true,
            coupons: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
              hasNextPage: false,
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
      }

      filter.store = new Types.ObjectId(store);
    }

    // Category filter
    if (category) {
      filter.category = new Types.ObjectId(category);
    }

    // Coupon type filter
    if (type) {
      filter.type = type;
    }

    // Country filter
    if (country) {
      filter.country = country;
    }

    // Verified filter
    if (isVerified !== undefined) {
      filter.isVerified = isVerified;
    }

    if (isFeatured !== undefined) {
        filter.isFeatured = isFeatured;
    }

    // Search filter
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

    // Exclude coupons belonging to inactive or deleted stores.
    const activeStoreIds = await Store.distinct("_id", {
      isActive: true,
    });

    filter.store = {
      $in: activeStoreIds,
      ...(store ? { $eq: new Types.ObjectId(store) } : {}),
    };

    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      Coupon.find(filter)
        .select(
          "title slug description type code image store category discount affiliateUrl country isVerified isFeatured startsAt expiresAt sortOrder createdAt"
        )
        .sort(sortOptions[sort])
        .skip(skip)
        .limit(limit)
        .populate("store", "name slug logo isActive")
        .populate("category", "name slug")
        .lean(),

      Coupon.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,

        coupons: coupons
          .filter((coupon) => {
            const populatedStore = coupon.store as unknown as {
              isActive: boolean;
            } | null;

            return populatedStore?.isActive === true;
          })
          .map((coupon) => {
            const populatedStore = coupon.store as unknown as {
              _id: Types.ObjectId;
              name: string;
              slug: string;
              logo?: string;
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
              description: coupon.description ?? "",
              type: coupon.type,
              code: coupon.code ?? "",
              image: coupon.image ?? "",

              store: populatedStore
                ? {
                    id: populatedStore._id.toString(),
                    name: populatedStore.name,
                    slug: populatedStore.slug,
                    logo: populatedStore.logo ?? "",
                  }
                : null,

              category: populatedCategory
                ? {
                    id: populatedCategory._id.toString(),
                    name: populatedCategory.name,
                    slug: populatedCategory.slug,
                  }
                : null,

              discount: coupon.discount ?? "",
              affiliateUrl: coupon.affiliateUrl,
              country: coupon.country,
              isVerified: coupon.isVerified,
              isFeatured: coupon.isFeatured,
              startsAt: coupon.startsAt ?? null,
              expiresAt: coupon.expiresAt ?? null,
              sortOrder: coupon.sortOrder,
              createdAt: coupon.createdAt,
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
