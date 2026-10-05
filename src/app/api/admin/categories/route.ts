import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-guards";
import {
  createCategorySchema,
  categoryQuerySchema,
} from "@/lib/validations/category";
import { handleApiError } from "@/lib/errors/handleApiError";
import Category from "@/models/Category";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const validation = createCategorySchema.safeParse(body);

    if (!validation.success) {
      throw validation.error;
    }

    const categoryData = validation.data;

    await connectDB();

    const category = await Category.create(categoryData);

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        category: {
          id: category._id.toString(),
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          contentTypes: category.contentTypes,
          isActive: category.isActive,
          isFeatured: category.isFeatured,
          sortOrder: category.sortOrder,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
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

    const query = categoryQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );

    if (!query.success) {
      throw query.error;
    }

    const {
      page,
      limit,
      search,
      contentType,
      isActive,
      isFeatured,
    } = query.data;

    await connectDB();

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (contentType) {
      filter.contentTypes = contentType;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }

    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      Category.find(filter)
        .sort({
          sortOrder: 1,
          name: 1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Category.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        categories: categories.map((category) => ({
          id: category._id.toString(),
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          contentTypes: category.contentTypes,
          isActive: category.isActive,
          isFeatured: category.isFeatured,
          sortOrder: category.sortOrder,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
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



// it supports all filters together in query params , GET /api/admin/categories?page=1&limit=20&search=elect&type=both&isActive=true&isFeatured=true     (all are optionals , we can keep any number of filters together in query params)

// Why Promise.all()?
// This part:
// const [categories, total] = await Promise.all([
//   Category.find(...),
//   Category.countDocuments(filter),
// ]);
// runs the two database operations concurrently rather than waiting for one and then starting the other.