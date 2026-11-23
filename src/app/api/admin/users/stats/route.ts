
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-guards";
import User from "@/models/User";
import { handleApiError } from "@/lib/errors/handleApiError";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ role: "admin" }),
    ]);

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          adminUsers,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}