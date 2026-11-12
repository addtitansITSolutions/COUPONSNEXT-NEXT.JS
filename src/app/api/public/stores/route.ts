// import { NextRequest, NextResponse } from "next/server";
// import { Types } from "mongoose";
// import { z } from "zod";
// import { connectDB } from "@/lib/mongodb";
// import { handleApiError } from "@/lib/errors/handleApiError";
// import Store from "@/models/Store";
// import Category from "@/models/Category";
// import { ApiError } from "@/lib/errors/ApiError";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// const publicStoreQuerySchema = z.object({
//   page: z.coerce.number().int().min(1).default(1),

//   limit: z.coerce.number().int().min(1).max(48).default(24),

//   search: z.string().trim().max(100).optional(),

//   letter: z
//     .string()
//     .trim()
//     .toUpperCase()
//     .regex(/^[A-Z]$/, "Invalid alphabet letter.")
//     .optional(),

//   category: z
//     .string()
//     .trim()
//     .refine((value) => Types.ObjectId.isValid(value), {
//       message: "Invalid category ID.",
//     })
//     .optional(),

//   sort: z.enum(["manual", "alphabetical"]).default("manual"),

//   featured: z
//     .enum(["true", "false"])
//     .transform((value) => value === "true")
//     .optional(),
// });

// function escapeRegex(value: string) {
//   return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);

//     const queryResult = publicStoreQuerySchema.safeParse(
//       Object.fromEntries(searchParams.entries())
//     );

//     if (!queryResult.success) {
//       throw queryResult.error;
//     }

//     const {
//       page,
//       limit,
//       search,
//       letter,
//       category,
//       sort,
//       featured,
//     } = queryResult.data;

//     await connectDB();

//     if (category) {
//         const activeCategory = await Category.exists({
//             _id: new Types.ObjectId(category),
//             isActive: true,
//             contentTypes: "store",
//         });

//         if (!activeCategory) {
//             throw new ApiError(
//             400,
//             "The selected category is not available for stores.",
//             "INVALID_STORE_CATEGORY"
//             );
//         }
//     }

//     const filter: Record<string, unknown> = {
//       isActive: true,
//     };

//     const nameConditions: Record<string, unknown>[] = [];

//     if (search) {
//         nameConditions.push({
//             name: {
//             $regex: escapeRegex(search),
//             $options: "i",
//             },
//         });
//     }

//     if (letter) {
//         nameConditions.push({
//             name: {
//             $regex: `^${letter}`,
//             $options: "i",
//             },
//         });
//     }

//     if (nameConditions.length > 0) {
//         filter.$and = nameConditions;
//     }

//     // Category filter.
//     if (category) {
//       filter.category = new Types.ObjectId(category);
//     }

//     // Featured store filter.
//     if (featured !== undefined) {
//       filter.isFeatured = featured;
//     }

//     // Alphabetical selection takes priority over manual sorting.
//     const sortOptions =
//       letter || sort === "alphabetical"
//         ? {
//             name: 1 as const,
//             sortOrder: 1 as const,
//             _id: 1 as const,
//           }
//         : {
//             sortOrder: 1 as const,
//             name: 1 as const,
//             _id: 1 as const,
//           };

//     const skip = (page - 1) * limit;

//     const [stores, total, categories] = await Promise.all([
//       Store.find(filter)
//         .select(
//           "name slug description logo storeBanner websiteUrl country category isFeatured sortOrder createdAt"
//         )
//         .sort(sortOptions)
//         .skip(skip)
//         .limit(limit)
//         .populate({
//           path: "category",
//           model: Category,
//           select: "name slug",
//         })
//         .lean(),

//       Store.countDocuments(filter),

//       Category.find({
//         isActive: true,
//         contentTypes: "store",
//       })
//         .select("name slug")
//         .sort({ name: 1 })
//         .lean(),
//     ]);

//     const formattedStores = stores.map((store) => {
//       const populatedCategory = store.category as unknown as {
//         _id: Types.ObjectId;
//         name: string;
//         slug: string;
//       } | null;

//       return {
//         id: store._id.toString(),
//         name: store.name,
//         slug: store.slug,
//         description: store.description ?? "",
//         logo: store.logo ?? "",
//         storeBanner: store.storeBanner ?? "",
//         websiteUrl: store.websiteUrl ?? "",
//         country: store.country ?? "",
//         isFeatured: store.isFeatured,
//         sortOrder: store.sortOrder,
//         category: populatedCategory
//           ? {
//               id: populatedCategory._id.toString(),
//               name: populatedCategory.name,
//               slug: populatedCategory.slug,
//             }
//           : null,
//         createdAt: store.createdAt,
//       };
//     });

//     const formattedCategories = categories.map((category) => ({
//       id: category._id.toString(),
//       name: category.name,
//       slug: category.slug,
//     }));

//     const totalPages = Math.ceil(total / limit);

//     return NextResponse.json(
//       {
//         success: true,
//         stores: formattedStores,
//         categories: formattedCategories,
//         pagination: {
//           page,
//           limit,
//           total,
//           totalPages,
//           hasNextPage: page < totalPages,
//           hasPreviousPage: page > 1,
//         },
//       },
//       {
//         status: 200,
//         headers: {
//           "Cache-Control": "no-store",
//         },
//       }
//     );
//   } catch (error) {
//     return handleApiError(error, request);
//   }
// }






import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import { handleApiError } from "@/lib/errors/handleApiError";
import Store from "@/models/Store";
import Category from "@/models/Category";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const publicStoreQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(48).default(24),

  search: z.string().trim().max(100).optional(),

  letter: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]$/, "Invalid alphabet letter.")
    .optional(),

  // Category slug instead of MongoDB ObjectId.
  category: z.string().trim().min(1).max(100).optional(),

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

    const queryResult = publicStoreQuerySchema.safeParse(
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
      category,
      sort,
      featured,
    } = queryResult.data;

    await connectDB();

    // Resolve category slug to its MongoDB ID.
    const activeCategory = category
      ? await Category.findOne({
          slug: category,
          isActive: true,
          contentTypes: "store",
        })
          .select("_id")
          .lean()
      : null;

    const filter: Record<string, unknown> = {
      isActive: true,
    };

    // Category filter.
    if (category) {
      if (activeCategory) {
        filter.category = activeCategory._id;
      } else {
        // Invalid category slug: return no stores.
        filter._id = { $exists: false };
      }
    }

    const nameConditions: Record<string, unknown>[] = [];

    if (search) {
      nameConditions.push({
        name: {
          $regex: escapeRegex(search),
          $options: "i",
        },
      });
    }

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

    // Featured store filter.
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

    const [stores, total, categories] = await Promise.all([
      Store.find(filter)
        .select(
          "name slug description logo storeBanner websiteUrl country category isFeatured sortOrder createdAt"
        )
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate({
          path: "category",
          model: Category,
          select: "name slug",
        })
        .lean(),

      Store.countDocuments(filter),

      Category.find({
        isActive: true,
        contentTypes: "store",
      })
        .select("name slug")
        .sort({ name: 1 })
        .lean(),
    ]);

    const formattedStores = stores.map((store) => {
      const populatedCategory = store.category as unknown as {
        _id: Types.ObjectId;
        name: string;
        slug: string;
      } | null;

      return {
        id: store._id.toString(),
        name: store.name,
        slug: store.slug,
        description: store.description ?? "",
        logo: store.logo ?? "",
        storeBanner: store.storeBanner ?? "",
        websiteUrl: store.websiteUrl ?? "",
        country: store.country ?? "",
        isFeatured: store.isFeatured,
        sortOrder: store.sortOrder,
        category: populatedCategory
          ? {
              id: populatedCategory._id.toString(),
              name: populatedCategory.name,
              slug: populatedCategory.slug,
            }
          : null,
        createdAt: store.createdAt,
      };
    });

    const formattedCategories = categories.map((category) => ({
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        stores: formattedStores,
        categories: formattedCategories,
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
