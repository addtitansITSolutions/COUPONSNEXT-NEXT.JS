import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-guards";
import { handleApiError } from "@/lib/errors/handleApiError";
import { userQuerySchema } from "@/lib/validations/user";
import User from "@/models/User";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const query = userQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );
    if (!query.success) {
      throw query.error;
    }
    const { page, limit, search, role, isActive } = query.data;
    await connectDB();
    const filter: Record<string, unknown> = {};
    // Search by name or email.
    if (search) {
      const searchRegex = {
        $regex: escapeRegex(search),
        $options: "i",
      };
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
      ];
    }
    // Filter by role.
    if (role) {
      filter.role = role;
    }
    // Filter by active status.
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter)
        .select("name email role isActive createdAt updatedAt")
        .sort({
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        users: users.map((user) => ({
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),

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
