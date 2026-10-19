import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-guards";
import { handleApiError } from "@/lib/errors/handleApiError";
import { ApiError } from "@/lib/errors/ApiError";
import { createCouponSchema, updateCouponSchema, } from "@/lib/validations/coupon";
import { deleteUploadedImage } from "@/lib/uploads";
import Coupon from "@/models/Coupon";
import Store from "@/models/Store";
import Category from "@/models/Category";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

function validateCouponId(id: string) {
  if (!objectIdRegex.test(id)) {
    throw new ApiError(
      400,
      "Coupon ID must be a valid MongoDB ObjectId",
      "INVALID_COUPON_ID"
    );
  }
}

function couponResponse(coupon: any) {
  const store = coupon.store;
  const category = coupon.category;

  return {
    id: coupon._id.toString(),
    title: coupon.title,
    slug: coupon.slug,
    description: coupon.description,
    type: coupon.type,
    code: coupon.code,
    image: coupon.image || "",
    store: store
      ? {
          id: store._id.toString(),
          name: store.name,
          slug: store.slug,
          logo: store.logo || "",
          storeBanner: store.storeBanner || "",
          isActive: store.isActive,
        }
      : null,
    category: category
      ? {
          id: category._id.toString(),
          name: category.name,
          slug: category.slug,
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
}

async function populateCoupon(id: string) {
  return Coupon.findById(id)
    .populate("store", "name slug logo storeBanner isActive")
    .populate("category", "name slug");
}

// GET /api/admin/coupons/[id]
export async function GET( request: NextRequest, { params }: { params: Promise<{ id: string }> } ) {
  try {
    await requireAdmin();
    const { id } = await params;
    validateCouponId(id);
    await connectDB();
    const coupon = await populateCoupon(id);
    if (!coupon) {
      throw new ApiError(
        404,
        "Coupon not found",
        "COUPON_NOT_FOUND"
      );
    }
    return NextResponse.json(
      {
        success: true,
        coupon: couponResponse(coupon),
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
    validateCouponId(id);
    const body = await request.json();
    const validation = updateCouponSchema.safeParse(body);
    if (!validation.success) {
      throw validation.error;
    }
    const couponData = validation.data;
    await connectDB();
    const existingCoupon = await Coupon.findById(id);
    if (!existingCoupon) {
      throw new ApiError(
        404,
        "Coupon not found",
        "COUPON_NOT_FOUND"
      );
    }

    // Determine the final coupon type and code.
    const finalType = couponData.type ?? existingCoupon.type;
    const finalCode = couponData.code !== undefined ? couponData.code.trim() : existingCoupon.code?.trim();

    const finalStartsAt = couponData.startsAt !== undefined ? couponData.startsAt : existingCoupon.startsAt;

    const finalExpiresAt = couponData.expiresAt !== undefined ? couponData.expiresAt : existingCoupon.expiresAt;

    // Code coupons must have a code.
    if (finalType === "code" && !finalCode) {
      throw new ApiError(
        400,
        "A coupon code is required for code-type coupons",
        "COUPON_CODE_REQUIRED"
      );
    }

    // Deal coupons do not need a code.
    // Any previous code will be cleared automatically below.

    // Validate the date range.
    if ( finalStartsAt && finalExpiresAt && new Date(finalExpiresAt).getTime() <= new Date(finalStartsAt).getTime() ) {
      throw new ApiError(
        400,
        "The expiry date must be later than the start date",
        "INVALID_COUPON_DATES"
      );
    }

    // Check slug uniqueness against other coupons.
    if ( couponData.slug && couponData.slug !== existingCoupon.slug ) {
      const duplicateSlug = await Coupon.exists({
        slug: couponData.slug,
        _id: { $ne: existingCoupon._id },
      });

      if (duplicateSlug) {
        throw new ApiError(
          409,
          "A coupon with this slug already exists",
          "COUPON_SLUG_EXISTS"
        );
      }
    }

    // Validate the selected store.
    const finalStoreId = couponData.store ?? existingCoupon.store.toString();

    const store = await Store.findById(finalStoreId)
      .select("name slug logo isActive");

    if (!store) {
      throw new ApiError(
        404,
        "The selected store could not be found",
        "STORE_NOT_FOUND"
      );
    }

    const finalStatus = couponData.status ?? existingCoupon.status;

    if (finalStatus === "published" && !store.isActive) {
      throw new ApiError(
        400,
        "A coupon cannot be published while its store is inactive",
        "STORE_INACTIVE"
      );
    }

    // Validate the category when one is assigned.
    const finalCategoryId = couponData.category !== undefined ? couponData.category : existingCoupon.category?.toString();

    if (finalCategoryId) {
      const category = await Category.findById(finalCategoryId).select("name slug contentTypes isActive");

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
          "CATEGORY_CONTENT_TYPE_INVALID"
        );
      }

      if (finalStatus === "published" && !category.isActive) {
        throw new ApiError(
          400,
          "A coupon cannot be published in an inactive category",
          "CATEGORY_INACTIVE"
        );
      }
    }

    const oldImage = existingCoupon.image;

    const { image, ...otherCouponData } = couponData;

    Object.assign(existingCoupon, otherCouponData);

    if (image === null) {
      existingCoupon.image = undefined;
    } else if (image !== undefined) {
      existingCoupon.image = image;
    }

    // Normalize the code and clear it for deal coupons.
    if (finalType === "deal") {
      existingCoupon.code = undefined;
    } else if (finalCode) {
      existingCoupon.code = finalCode;
    }

    // Validate and save the resulting document.
    await existingCoupon.validate();
    await existingCoupon.save();

    // Delete the old image only after the database save succeeds.
    if (oldImage && oldImage !== existingCoupon.image) {
      try {
        await deleteUploadedImage(oldImage);
      } catch (cleanupError) {
        console.error(
          "[Coupon image cleanup] Failed to delete old image:",
          cleanupError
        );
      }
    }

    const updatedCoupon = await populateCoupon(id);

    if (!updatedCoupon) {
      throw new ApiError(
        404,
        "Coupon was updated but could not be retrieved",
        "COUPON_RETRIEVAL_FAILED"
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Coupon updated successfully",
        coupon: couponResponse(updatedCoupon),
      },
      {
        status: 200,
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



//testing havings logs

// export async function PATCH(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     await requireAdmin();

//     const { id } = await params;
//     validateCouponId(id);

//     const body = await request.json();

//     console.log("[Coupon DEBUG] Incoming request body:", body);

//     const validation = updateCouponSchema.safeParse(body);

//     if (!validation.success) {
//       console.error(
//         "[Coupon DEBUG] Validation failed:",
//         validation.error.flatten()
//       );
//       throw validation.error;
//     }

//     const couponData = validation.data;

//     console.log("[Coupon DEBUG] Validated update data:", couponData);

//     await connectDB();

//     const existingCoupon = await Coupon.findById(id);

//     if (!existingCoupon) {
//       throw new ApiError(
//         404,
//         "Coupon not found",
//         "COUPON_NOT_FOUND"
//       );
//     }

//     console.log("[Coupon DEBUG] Before update:", {
//       isFeatured: existingCoupon.isFeatured,
//       isVerified: existingCoupon.isVerified,
//     });

//     const finalType = couponData.type ?? existingCoupon.type;

//     const finalCode =
//       couponData.code !== undefined
//         ? couponData.code.trim()
//         : existingCoupon.code?.trim();

//     const finalStartsAt =
//       couponData.startsAt !== undefined
//         ? couponData.startsAt
//         : existingCoupon.startsAt;

//     const finalExpiresAt =
//       couponData.expiresAt !== undefined
//         ? couponData.expiresAt
//         : existingCoupon.expiresAt;

//     if (finalType === "code" && !finalCode) {
//       throw new ApiError(
//         400,
//         "A coupon code is required for code-type coupons",
//         "COUPON_CODE_REQUIRED"
//       );
//     }

//     if (
//       finalStartsAt &&
//       finalExpiresAt &&
//       new Date(finalExpiresAt).getTime() <=
//         new Date(finalStartsAt).getTime()
//     ) {
//       throw new ApiError(
//         400,
//         "The expiry date must be later than the start date",
//         "INVALID_COUPON_DATES"
//       );
//     }

//     if (
//       couponData.slug &&
//       couponData.slug !== existingCoupon.slug
//     ) {
//       const duplicateSlug = await Coupon.exists({
//         slug: couponData.slug,
//         _id: { $ne: existingCoupon._id },
//       });

//       if (duplicateSlug) {
//         throw new ApiError(
//           409,
//           "A coupon with this slug already exists",
//           "COUPON_SLUG_EXISTS"
//         );
//       }
//     }

//     const finalStoreId =
//       couponData.store ?? existingCoupon.store.toString();

//     const store = await Store.findById(finalStoreId)
//       .select("name slug logo isActive");

//     if (!store) {
//       throw new ApiError(
//         404,
//         "The selected store could not be found",
//         "STORE_NOT_FOUND"
//       );
//     }

//     const finalStatus =
//       couponData.status ?? existingCoupon.status;

//     if (finalStatus === "published" && !store.isActive) {
//       throw new ApiError(
//         400,
//         "A coupon cannot be published while its store is inactive",
//         "STORE_INACTIVE"
//       );
//     }

//     const finalCategoryId =
//       couponData.category !== undefined
//         ? couponData.category
//         : existingCoupon.category?.toString();

//     if (finalCategoryId) {
//       const category = await Category.findById(finalCategoryId)
//         .select("name slug contentTypes isActive");

//       if (!category) {
//         throw new ApiError(
//           404,
//           "The selected category could not be found",
//           "CATEGORY_NOT_FOUND"
//         );
//       }

//       if (!category.contentTypes.includes("coupon")) {
//         throw new ApiError(
//           400,
//           "The selected category does not support coupons",
//           "CATEGORY_CONTENT_TYPE_INVALID"
//         );
//       }

//       if (
//         finalStatus === "published" &&
//         !category.isActive
//       ) {
//         throw new ApiError(
//           400,
//           "A coupon cannot be published in an inactive category",
//           "CATEGORY_INACTIVE"
//         );
//       }
//     }

//     const oldImage = existingCoupon.image;

//     // Apply only the submitted fields.
//     Object.assign(existingCoupon, couponData);

//     console.log("[Coupon DEBUG] After Object.assign:", {
//       isFeatured: existingCoupon.isFeatured,
//       isVerified: existingCoupon.isVerified,
//       updateKeys: Object.keys(couponData),
//     });

//     if (finalType === "deal") {
//       existingCoupon.code = undefined;
//     } else if (finalCode) {
//       existingCoupon.code = finalCode;
//     }

//     await existingCoupon.validate();

//     console.log("[Coupon DEBUG] After validate, before save:", {
//       isFeatured: existingCoupon.isFeatured,
//       isVerified: existingCoupon.isVerified,
//     });

//     await existingCoupon.save();

//     console.log("[Coupon DEBUG] After save:", {
//       isFeatured: existingCoupon.isFeatured,
//       isVerified: existingCoupon.isVerified,
//     });

//     // Read directly from MongoDB without population or response mapping.
//     const rawSavedCoupon = await Coupon.findById(id)
//       .select("isFeatured isVerified")
//       .lean();

//     console.log("[Coupon DEBUG] Fresh database read:", {
//       isFeatured: rawSavedCoupon?.isFeatured,
//       isVerified: rawSavedCoupon?.isVerified,
//     });

//     if (oldImage && oldImage !== existingCoupon.image) {
//       try {
//         await deleteUploadedImage(oldImage);
//       } catch (cleanupError) {
//         console.error(
//           "[Coupon image cleanup] Failed to delete old image:",
//           cleanupError
//         );
//       }
//     }

//     const updatedCoupon = await populateCoupon(id);

//     if (!updatedCoupon) {
//       throw new ApiError(
//         404,
//         "Coupon was updated but could not be retrieved",
//         "COUPON_RETRIEVAL_FAILED"
//       );
//     }

//     console.log("[Coupon DEBUG] After populateCoupon:", {
//       isFeatured: updatedCoupon.isFeatured,
//       isVerified: updatedCoupon.isVerified,
//     });

//     const responseCoupon = couponResponse(updatedCoupon);

//     console.log("[Coupon DEBUG] Final API response:", {
//       isFeatured: responseCoupon.isFeatured,
//       isVerified: responseCoupon.isVerified,
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Coupon updated successfully",
//         coupon: responseCoupon,
//       },
//       {
//         status: 200,
//         headers: {
//           "Cache-Control": "no-store",
//         },
//       }
//     );
//   } catch (error) {
//     if (
//       error &&
//       typeof error === "object" &&
//       "code" in error &&
//       error.code === 11000
//     ) {
//       return handleApiError(
//         new ApiError(
//           409,
//           "A coupon with this slug already exists",
//           "COUPON_SLUG_EXISTS"
//         ),
//         request
//       );
//     }

//     return handleApiError(error, request);
//   }
// }










// DELETE /api/admin/coupons/[id]
export async function DELETE( request: NextRequest, { params }: { params: Promise<{ id: string }> } ) {
  try {
    await requireAdmin();
    const { id } = await params;
    validateCouponId(id);
    await connectDB();
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      throw new ApiError(
        404,
        "Coupon not found",
        "COUPON_NOT_FOUND"
      );
    }
    // Save the coupon image URL before deleting the document.
    const imageUrl = coupon.image;
    const deleteResult = await Coupon.deleteOne({ _id: coupon._id, });
    if (deleteResult.deletedCount !== 1) {
      throw new ApiError(
        404,
        "Coupon could not be deleted because it no longer exists",
        "COUPON_DELETE_FAILED"
      );
    }

    // Delete only the coupon's own uploaded image.
    if (imageUrl?.trim()) {
      try {
        await deleteUploadedImage(imageUrl);
      } catch (cleanupError) {
        console.error(
          "[Coupon image cleanup] Failed to delete image:",
          cleanupError
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Coupon deleted successfully",
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