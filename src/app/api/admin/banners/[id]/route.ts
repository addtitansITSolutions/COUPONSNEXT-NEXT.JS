import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-guards";
import { handleApiError } from "@/lib/errors/handleApiError";
import { ApiError } from "@/lib/errors/ApiError";
import { updateBannerSchema } from "@/lib/validations/banner";
import { deleteUploadedImage } from "@/lib/uploads";
import Banner from "@/models/Banner";
import Store from "@/models/Store";
export const runtime = "nodejs";
type RouteContext = { params: Promise<{ id: string }>; };

// GET: Fetch one banner by ID.
export async function GET( request: NextRequest, { params }: RouteContext ) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new ApiError(
        400,
        "Banner ID must be a valid MongoDB ObjectId",
        "INVALID_BANNER_ID"
      );
    }

    await connectDB();
    const banner = await Banner.findById(id).populate("store", "name slug logo").lean();

    if (!banner) {
      throw new ApiError(
        404,
        "Banner not found",
        "BANNER_NOT_FOUND"
      );
    }

    const populatedStore = banner.store as unknown as {
      _id: { toString(): string };
      name: string;
      slug: string;
      logo?: string;
    } | null;

    return NextResponse.json(
      {
        success: true,
        banner: {
          id: banner._id.toString(),
          title: banner.title,
          subtitle: banner.subtitle,
          desktopImage: banner.desktopImage,
          mobileImage: banner.mobileImage,
          store: populatedStore
            ? {
                id: populatedStore._id.toString(),
                name: populatedStore.name,
                slug: populatedStore.slug,
                logo: populatedStore.logo,
              }
            : null,
          affiliateUrl: banner.affiliateUrl,
          country: banner.country,
          isActive: banner.isActive,
          sortOrder: banner.sortOrder,
          createdAt: banner.createdAt,
          updatedAt: banner.updatedAt,
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

// PATCH: Update an existing banner.
export async function PATCH( request: NextRequest, { params }: RouteContext ) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new ApiError(
        400,
        "Banner ID must be a valid MongoDB ObjectId",
        "INVALID_BANNER_ID"
      );
    }

    const body = await request.json();
    const validation = updateBannerSchema.safeParse(body);
    if (!validation.success) {
      throw validation.error;
    }
    const bannerData = validation.data;
    await connectDB();
    const existingBanner = await Banner.findById(id);
    if (!existingBanner) {
      throw new ApiError(
        404,
        "Banner not found",
        "BANNER_NOT_FOUND"
      );
    }

    // Capture existing images before updating.
    const oldDesktopImage = existingBanner.desktopImage;
    const oldMobileImage = existingBanner.mobileImage;

    // Validate the store only when a new store is provided.
    if (bannerData.store) {
      const storeExists = await Store.exists({
        _id: bannerData.store,
      });

      if (!storeExists) {
        throw new ApiError(
          404,
          "The selected store could not be found",
          "STORE_NOT_FOUND"
        );
      }
    }

    // Update only the fields supplied by the request.
    Object.assign(existingBanner, bannerData);

    // Save database changes before deleting any old images.
    await existingBanner.save();

    // Collect replaced images.
    const currentImageUrls = new Set([
      existingBanner.desktopImage,
      existingBanner.mobileImage,
    ]);

    const imagesToDelete = [
      oldDesktopImage,
      oldMobileImage,
    ].filter(
      (url): url is string =>
        typeof url === "string" &&
        url.trim().length > 0 &&
        !currentImageUrls.has(url)
    );

    // Avoid deleting the same image twice.
    for (const imageUrl of new Set(imagesToDelete)) {
      try {
        await deleteUploadedImage(imageUrl);
      } catch (cleanupError) {
        // The update succeeded; image cleanup failure
        // should not make the API report a failed update.
        console.error(
          `[Banner image cleanup] Failed to delete ${imageUrl}:`,
          cleanupError
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Banner updated successfully",
        banner: {
          id: existingBanner._id.toString(),
          title: existingBanner.title,
          subtitle: existingBanner.subtitle,
          desktopImage: existingBanner.desktopImage,
          mobileImage: existingBanner.mobileImage,
          store: existingBanner.store.toString(),
          affiliateUrl: existingBanner.affiliateUrl,
          country: existingBanner.country,
          isActive: existingBanner.isActive,
          sortOrder: existingBanner.sortOrder,
          createdAt: existingBanner.createdAt,
          updatedAt: existingBanner.updatedAt,
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

// DELETE: Delete a banner.
export async function DELETE( request: NextRequest, { params }: RouteContext ) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new ApiError(
        400,
        "Banner ID must be a valid MongoDB ObjectId",
        "INVALID_BANNER_ID"
      );
    }
    await connectDB();
    const banner = await Banner.findById(id);
    if (!banner) {
      throw new ApiError(
        404,
        "Banner not found",
        "BANNER_NOT_FOUND"
      );
    }
    // Capture image URLs before deleting the document.
    const imageUrls = [
      banner.desktopImage,
      banner.mobileImage,
    ].filter(
      (url): url is string =>
        typeof url === "string" &&
        url.trim().length > 0
    );
    const uniqueImageUrls = [...new Set(imageUrls)];
    // Delete the banner from MongoDB first.
    const deleteResult = await Banner.deleteOne({
      _id: banner._id,
    });
    if (deleteResult.deletedCount !== 1) {
      throw new ApiError(
        404,
        "Banner could not be deleted because it no longer exists",
        "BANNER_DELETE_FAILED"
      );
    }
    // Clean up images after successful deletion.
    for (const imageUrl of uniqueImageUrls) {
      try {
        await deleteUploadedImage(imageUrl);
      } catch (cleanupError) {
        console.error(
          `[Banner image cleanup] Failed to delete ${imageUrl}:`,
          cleanupError
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Banner deleted successfully",
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
