import "server-only";

import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const UPLOAD_FOLDERS = [
  "logos",
  "banners",
  "coupons",
  "blogs",
] as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_IMAGE_PIXELS = 40_000_000;

const ALLOWED_FORMATS = ["jpeg", "png", "webp"];

export interface UploadedImage {
  filename: string;
  folder: UploadFolder;
  url: string;
  size: number;
}

export class UploadError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
    public readonly code: string = "INVALID_IMAGE"
  ) {
    super(message);
    this.name = "UploadError";
  }
}

export async function saveUploadedImage(
  file: File,
  folder: UploadFolder
): Promise<UploadedImage> {
  if (!UPLOAD_FOLDERS.includes(folder)) {
    throw new UploadError(
      "Unsupported upload folder.",
      400,
      "INVALID_UPLOAD_FOLDER"
    );
  }

  if (file.size === 0) {
    throw new UploadError(
      "Please select a valid image.",
      400,
      "EMPTY_FILE"
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError(
      "Images must be 5 MB or smaller.",
      413,
      "FILE_TOO_LARGE"
    );
  }

  const uploadDir = process.env.UPLOAD_DIR;

  if (!uploadDir?.trim()) {
    throw new Error("UPLOAD_DIR is not configured.");
  }

  const input = Buffer.from(await file.arrayBuffer());

  // Validate the actual file contents, not its filename or MIME type.
  let metadata: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;

  try {
    metadata = await sharp(input, {
      limitInputPixels: MAX_IMAGE_PIXELS,
      failOn: "error",
    }).metadata();
  } catch {
    throw new UploadError(
      "Invalid image. Please upload a valid JPEG, PNG, or WebP file.",
      400,
      "INVALID_IMAGE"
    );
  }

  if (
    !metadata.format ||
    !ALLOWED_FORMATS.includes(metadata.format)
  ) {
    throw new UploadError(
      "Only JPEG, PNG, and WebP images are supported.",
      400,
      "UNSUPPORTED_IMAGE_FORMAT"
    );
  }

  if (
    !metadata.width ||
    !metadata.height ||
    metadata.width * metadata.height > MAX_IMAGE_PIXELS
  ) {
    throw new UploadError(
      "Image dimensions are too large.",
      400,
      "IMAGE_DIMENSIONS_TOO_LARGE"
    );
  }

  // Decode and re-encode the image as WebP.
  // This also catches truncated or corrupted image data.
  let output: Buffer;

  try {
    output = await sharp(input, {
      limitInputPixels: MAX_IMAGE_PIXELS,
      failOn: "error",
    })
      .rotate()
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
  } catch {
    throw new UploadError(
      "The image is corrupted or cannot be processed.",
      400,
      "INVALID_IMAGE"
    );
  }

  const filename = `${randomUUID()}.webp`;
  const targetDir = path.resolve(uploadDir, folder);
  const targetPath = path.join(targetDir, filename);

  await mkdir(targetDir, { recursive: true });

  // Prevent accidentally overwriting an existing file.
  await writeFile(targetPath, output, {
    flag: "wx",
  });

  return {
    filename,
    folder,
    url: `/uploads/${folder}/${filename}`,
    size: output.length,
  };
}
