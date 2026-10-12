import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";
import { handleApiError } from "@/lib/errors/handleApiError";
import { ApiError } from "@/lib/errors/ApiError";
import { saveUploadedImage, deleteUploadedImage, UPLOAD_FOLDERS, type UploadFolder, UploadError } from "@/lib/uploads";

export const runtime = "nodejs";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder");

    if (!(file instanceof File)) {
      throw new ApiError(
        400,
        "Please select an image to upload",
        "FILE_REQUIRED"
      );
    }

    if (
      typeof folder !== "string" ||
      !UPLOAD_FOLDERS.includes(folder as UploadFolder)
    ) {
      throw new ApiError(
        400,
        "Invalid upload folder",
        "INVALID_UPLOAD_FOLDER"
      );
    }

    if (file.size === 0) {
      throw new ApiError(
        400,
        "Please select a valid image",
        "EMPTY_FILE"
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ApiError(
        413,
        "Images must be 5 MB or smaller",
        "FILE_TOO_LARGE"
      );
    }

    let uploadedImage;

    try {
      uploadedImage = await saveUploadedImage(
        file,
        folder as UploadFolder
      );
    } catch (error) {
      if (error instanceof UploadError) {
        throw new ApiError(
          error.statusCode,
          error.message,
          error.code
        );
      }

      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded successfully",
        image: uploadedImage,
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




export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      throw new ApiError(
        400,
        "Invalid request body.",
        "INVALID_REQUEST_BODY"
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("imageUrl" in body) ||
      typeof body.imageUrl !== "string" ||
      !body.imageUrl.trim()
    ) {
      throw new ApiError(
        400,
        "A valid imageUrl is required.",
        "INVALID_IMAGE_URL"
      );
    }

    let result: { deleted: boolean };

    try {
      result = await deleteUploadedImage(body.imageUrl);
    } catch (error) {
      if (error instanceof UploadError) {
        throw new ApiError(
          error.statusCode,
          error.message,
          error.code
        );
      }

      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message: result.deleted
          ? "Image deleted successfully."
          : "Image was already missing.",
        deleted: result.deleted,
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
