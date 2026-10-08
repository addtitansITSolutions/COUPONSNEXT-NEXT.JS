import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-guards";
import { createStoreSchema, storeQuerySchema } from "@/lib/validations/store";
import { handleApiError } from "@/lib/errors/handleApiError";
import Store from "@/models/Store";
import Category from "@/models/Category";
import { ApiError } from "@/lib/errors/ApiError";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const validation = createStoreSchema.safeParse(body);
    if (!validation.success) {
      throw validation.error;
    }
    const storeData = validation.data;
    await connectDB();

    if (storeData.category) {
      const categoryExists = await Category.exists({
        _id: storeData.category,
      });

      if (!categoryExists) {
        throw new ApiError(
          404,
          "The selected category could not be found",
          "CATEGORY_NOT_FOUND"
        );
      }
    }

    const store = await Store.create(storeData);
    return NextResponse.json(
      {
        success: true,
        message: "Store created successfully",
        store: {
          id: store._id.toString(),
          name: store.name,
          slug: store.slug,
          description: store.description,
          logo: store.logo,
          storeBanner: store.storeBanner,
          websiteUrl: store.websiteUrl,
          affiliateUrl: store.affiliateUrl,
          country: store.country,
          category: store.category
            ? store.category.toString()
            : undefined,
          isActive: store.isActive,
          isFeatured: store.isFeatured,
          sortOrder: store.sortOrder,
          createdAt: store.createdAt,
          updatedAt: store.updatedAt,
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
    return handleApiError(error, request);
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const query = storeQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );
    if (!query.success) {
      throw query.error;
    }
    const {
      page,
      limit,
      search,
      category,
      isActive,
      isFeatured,
      country,
    } = query.data;

    await connectDB();

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (category) {
      filter.category = category;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }

    if (country) {
      filter.country = country;
    }

    const skip = (page - 1) * limit;

    const [stores, total] = await Promise.all([
      Store.find(filter)
        .sort({
          sortOrder: 1,
          name: 1,
        })
        .skip(skip)
        .limit(limit)
        .populate("category", "name slug")
        .lean(),

      Store.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        stores: stores.map((store) => ({
          id: store._id.toString(),
          name: store.name,
          slug: store.slug,
          description: store.description,
          logo: store.logo,
          storeBanner: store.storeBanner,
          websiteUrl: store.websiteUrl,
          affiliateUrl: store.affiliateUrl,
          country: store.country,
          category: store.category
            ? {
                id: store.category._id.toString(),
                name: store.category.name,
                slug: store.category.slug,
              }
            : null,
          isActive: store.isActive,
          isFeatured: store.isFeatured,
          sortOrder: store.sortOrder,
          createdAt: store.createdAt,
          updatedAt: store.updatedAt,
        })),
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