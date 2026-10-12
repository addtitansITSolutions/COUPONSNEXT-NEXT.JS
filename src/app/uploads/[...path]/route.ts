import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { UPLOAD_FOLDERS, type UploadFolder } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET( _request: NextRequest, context: { params: Promise<{ path: string[] }> } ) {
  const { path: segments } = await context.params;

  if ( segments.length !== 2 || !UPLOAD_FOLDERS.includes(segments[0] as UploadFolder) || !/^[a-f0-9-]+\.webp$/i.test(segments[1]) ) {
    return new NextResponse("Image not found", { status: 404 });
  }

  const uploadDir = process.env.UPLOAD_DIR;

  if (!uploadDir?.trim()) {
    return new NextResponse("Upload storage is not configured", {
      status: 500,
    });
  }

  try {
    const filePath = path.join( path.resolve(uploadDir), segments[0], segments[1] );

    const image = await readFile(filePath);

    return new NextResponse(new Uint8Array(image), {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Image not found", { status: 404 });
  }
}
