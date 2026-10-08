import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-guards";
import { handleApiError } from "@/lib/errors/handleApiError";
import { ApiError } from "@/lib/errors/ApiError";
import { updateStoreSchema } from "@/lib/validations/store";
import Store from "@/models/Store";
import Category from "@/models/Category";
import Coupon from "@/models/Coupon";

export const runtime = "nodejs";

export async function GET( request: NextRequest, { params }: { params: Promise<{ id: string }> } ) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new ApiError(
        400,
        "Store ID must be a valid MongoDB ObjectId",
        "INVALID_STORE_ID"
      );
    }
    await connectDB();
    const store = await Store.findById(id).populate("category", "name slug").lean();

    if (!store) {
      throw new ApiError(
        404,
        "Store not found",
        "STORE_NOT_FOUND"
      );
    }

    return NextResponse.json(
      {
        success: true,
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

export async function PATCH( request: NextRequest, { params }: { params: Promise<{ id: string }> } ) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new ApiError(
        400,
        "Store ID must be a valid MongoDB ObjectId",
        "INVALID_STORE_ID"
      );
    }
    const body = await request.json();
    const validation = updateStoreSchema.safeParse(body);

    if (!validation.success) {
      throw validation.error;
    }

    const storeData = validation.data;

    await connectDB();

    // Check whether the store exists
    const existingStore = await Store.findById(id);

    if (!existingStore) {
      throw new ApiError(
        404,
        "Store not found",
        "STORE_NOT_FOUND"
      );
    }

    // Check category only when a category is provided
    if (storeData.category) {
      const categoryExists = await Category.exists({ _id: storeData.category, });

      if (!categoryExists) {
        throw new ApiError(
          404,
          "The selected category could not be found",
          "CATEGORY_NOT_FOUND"
        );
      }
    }

    // Update only the fields provided in the request
    Object.assign(existingStore, storeData);

    await existingStore.save();

    return NextResponse.json(
      {
        success: true,
        message: "Store updated successfully",
        store: {
          id: existingStore._id.toString(),
          name: existingStore.name,
          slug: existingStore.slug,
          description: existingStore.description,
          logo: existingStore.logo,
          storeBanner: existingStore.storeBanner,
          websiteUrl: existingStore.websiteUrl,
          affiliateUrl: existingStore.affiliateUrl,
          country: existingStore.country,
          category: existingStore.category ? existingStore.category.toString() : undefined,
          isActive: existingStore.isActive,
          isFeatured: existingStore.isFeatured,
          sortOrder: existingStore.sortOrder,
          createdAt: existingStore.createdAt,
          updatedAt: existingStore.updatedAt,
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

export async function DELETE( request: NextRequest, { params }: { params: Promise<{ id: string }> } ) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new ApiError(
        400,
        "Store ID must be a valid MongoDB ObjectId",
        "INVALID_STORE_ID"
      );
    }
    await connectDB();
    const store = await Store.findById(id);
    if (!store) {
      throw new ApiError(
        404,
        "Store not found",
        "STORE_NOT_FOUND"
      );
    }

    const couponCount = await Coupon.countDocuments({ store: store._id, });

    if (couponCount > 0) {
      throw new ApiError(
        409,
        "This store cannot be deleted because it is being used by existing coupons",
        "STORE_IN_USE"
      );
    }

    await Store.deleteOne({ _id: store._id });

    return NextResponse.json(
      {
        success: true,
        message: "Store deleted successfully",
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