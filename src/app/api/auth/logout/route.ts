import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { handleApiError } from "@/lib/errors/handleApiError";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await clearAuthCookie();

    return NextResponse.json(
      {
        success: true,
        message: "Logout successful",
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