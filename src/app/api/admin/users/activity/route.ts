
import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-guards";
import ActivityLog from "@/models/ActivityLog";
import { handleApiError } from "@/lib/errors/handleApiError";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);

    const requestedPage = Number(searchParams.get("page") ?? 1);
    const requestedLimit = Number(searchParams.get("limit") ?? 10);

    const page =
      Number.isFinite(requestedPage) && requestedPage > 0
        ? Math.floor(requestedPage)
        : 1;

    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(Math.floor(requestedLimit), 50)
        : 10;

    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      ActivityLog.countDocuments({}),
      ActivityLog.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "user",
          select: "name email",
        })
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit);

    const activities = logs.map((log) => {
      const activityUser =
        log.user &&
        typeof log.user === "object" &&
        "name" in log.user
          ? (log.user as unknown as {
              name?: string;
              email?: string;
            })
          : null;

      return {
        id: String(log._id),
        action: log.action,
        description: log.description,
        userName: activityUser?.name ?? "Deleted user",
        userEmail: activityUser?.email ?? "",
        createdAt: new Date(log.createdAt).toISOString(),
      };
    });

    return NextResponse.json(
      {
        success: true,
        activities,
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
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}