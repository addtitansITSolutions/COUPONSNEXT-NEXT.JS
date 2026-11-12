
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import { handleApiError } from "@/lib/errors/handleApiError";
import Category from "@/models/Category";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const publicCategoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(24),
  search: z.string().trim().max(100).optional(),
  letter: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]$/, "Invalid alphabet letter.")
    .optional(),
  contentType: z
    .enum(["store", "coupon", "blog"])
    .default("coupon"),
  sort: z.enum(["manual", "alphabetical"]).default("manual"),
  featured: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryResult = publicCategoryQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );

    if (!queryResult.success) {
      throw queryResult.error;
    }

    const {
      page,
      limit,
      search,
      letter,
      contentType,
      sort,
      featured,
    } = queryResult.data;

    await connectDB();

    // Only return active categories belonging to the requested content type.
    const filter: Record<string, unknown> = {
      isActive: true,
      contentTypes: contentType,
    };

    // Search category names.
    const nameConditions: Record<string, unknown>[] = [];

    if (search) {
      nameConditions.push({
        name: {
          $regex: escapeRegex(search),
          $options: "i",
        },
      });
    }

    // Filter categories by starting letter.
    if (letter) {
      nameConditions.push({
        name: {
          $regex: `^${letter}`,
          $options: "i",
        },
      });
    }

    if (nameConditions.length > 0) {
      filter.$and = nameConditions;
    }

    // Featured category filter.
    if (featured !== undefined) {
      filter.isFeatured = featured;
    }

    // Alphabetical selection takes priority over manual sorting.
    const sortOptions =
      letter || sort === "alphabetical"
        ? {
            name: 1 as const,
            sortOrder: 1 as const,
            _id: 1 as const,
          }
        : {
            sortOrder: 1 as const,
            name: 1 as const,
            _id: 1 as const,
          };

    const skip = (page - 1) * limit;

    const [categories, total, categoryNames] = await Promise.all([
    Category.find(filter)
        .select(
        "name slug description image contentTypes isFeatured sortOrder createdAt"
        )
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),

    Category.countDocuments(filter),

    // Get available letters across all active coupon categories.
    Category.distinct("name", {
        isActive: true,
        contentTypes: contentType,
    }),
    ]);


    const availableLetters = Array.from(
    new Set(
        categoryNames
        .map((name) => name.trim().charAt(0).toUpperCase())
        .filter((letter) => /^[A-Z]$/.test(letter))
    )
    ).sort();

    const formattedCategories = categories.map((category) => ({
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      image: category.image ?? "",
      contentTypes: category.contentTypes,
      isFeatured: category.isFeatured,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        categories: formattedCategories,
        availableLetters,
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
