import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-guards";
import { ApiError } from "@/lib/errors/ApiError";
import { handleApiError } from "@/lib/errors/handleApiError";
import { updateCategorySchema } from "@/lib/validations/category";
import Category from "@/models/Category";
import Store from "@/models/Store";
import Coupon from "@/models/Coupon";
import Blog from "@/models/Blog";

export const runtime = "nodejs";

export async function GET( request: NextRequest, context: { params: Promise<{ id: string }>; } ) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(
        400,
        "Invalid category ID",
        "INVALID_CATEGORY_ID"
      );
    }

    await connectDB();

    const category = await Category.findById(id).lean();

    if (!category) {
      throw new ApiError(
        404,
        "Category not found",
        "CATEGORY_NOT_FOUND"
      );
    }

    return NextResponse.json(
      {
        success: true,
        category: {
          id: category._id.toString(),
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          type: category.type,
          isActive: category.isActive,
          isFeatured: category.isFeatured,
          sortOrder: category.sortOrder,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
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


export async function PATCH( request: NextRequest, context: { params: Promise<{ id: string }>; } ) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(
        400,
        "Invalid category ID",
        "INVALID_CATEGORY_ID"
      );
    }

    const body = await request.json();




    const validation = updateCategorySchema.safeParse(body);

    if (!validation.success) {
      throw validation.error;
    }

    const updateData = validation.data;

    await connectDB();

    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!category) {
      throw new ApiError(
        404,
        "Category not found",
        "CATEGORY_NOT_FOUND"
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Category updated successfully",
        category: {
          id: category._id.toString(),
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          type: category.type,
          isActive: category.isActive,
          isFeatured: category.isFeatured,
          sortOrder: category.sortOrder,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
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

export async function DELETE( request: NextRequest, context: { params: Promise<{ id: string }>; } ) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(
        400,
        "Invalid category ID",
        "INVALID_CATEGORY_ID"
      );
    }
    await connectDB();
    const category = await Category.findById(id).select("_id name").lean();
    if (!category) {
      throw new ApiError(
        404,
        "Category not found",
        "CATEGORY_NOT_FOUND"
      );
    }

    const [storeCount, couponCount, blogCount] = await Promise.all([
      Store.countDocuments({ category: category._id }),
      Coupon.countDocuments({ category: category._id }),
      Blog.countDocuments({ category: category._id }),
    ]);

    if (storeCount > 0 || couponCount > 0 || blogCount > 0) {
      throw new ApiError(
        409,
        "This category cannot be deleted because it is being used by stores, coupons, or blogs",
        "CATEGORY_IN_USE",
        {
          stores: storeCount,
          coupons: couponCount,
          blogs: blogCount,
        }
      );
    }

    await Category.deleteOne({
      _id: category._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully",
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