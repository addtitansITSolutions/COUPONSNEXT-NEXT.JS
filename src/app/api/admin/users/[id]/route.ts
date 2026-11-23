import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-guards";
import { ApiError } from "@/lib/errors/ApiError";
import { handleApiError } from "@/lib/errors/handleApiError";
import User from "@/models/User";
import ActivityLog from "@/models/ActivityLog";

import { createActivityLog } from "@/lib/activity-log";
import { userUpdateSchema } from "@/lib/validations/user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // Verify admin access
    await requireAdmin();

    // Get user ID from route params
    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(
        400,
        "Invalid user ID",
        "INVALID_USER_ID"
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Fetch user details
    const user = await User.findById(id)
      .select("name email role isActive createdAt updatedAt")
      .lean();

    if (!user) {
      throw new ApiError(
        404,
        "User not found",
        "USER_NOT_FOUND"
      );
    }

    // Fetch the user's latest 10 activities
    const activities = await ActivityLog.find({
      $or: [
        { user: new mongoose.Types.ObjectId(id) },
        { performedBy: new mongoose.Types.ObjectId(id) },
      ],
    })
      .select("user performedBy action description metadata createdAt")
      .sort({
        createdAt: -1,
        _id: -1,
      })
      .limit(10)
      .lean();

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        activities: activities.map((activity) => ({
          id: activity._id.toString(),
          userId: activity.user.toString(),
          performedBy: activity.performedBy?.toString() ?? null,
          action: activity.action,
          description: activity.description,
          metadata: activity.metadata,
          createdAt: activity.createdAt,
        })),
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






export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // Verify admin access
    const admin = await requireAdmin();

    // Get target user ID
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(
        400,
        "Invalid user ID",
        "INVALID_USER_ID"
      );
    }

    // Validate request body
    const body = await request.json();
    const validation = userUpdateSchema.safeParse(body);

    if (!validation.success) {
      throw validation.error;
    }

    const updates = validation.data;

    await connectDB();

    // Fetch existing user
    const user = await User.findById(id);

    if (!user) {
      throw new ApiError(
        404,
        "User not found",
        "USER_NOT_FOUND"
      );
    }

    const adminId = admin._id.toString();
    const targetUserId = user._id.toString();

    const isOwnAccount = adminId === targetUserId;

    // Prevent administrators from changing their own role
    if (isOwnAccount && updates.role !== undefined && updates.role !== user.role) {
      throw new ApiError(
        403,
        "You cannot change your own administrator role",
        "SELF_ROLE_CHANGE_NOT_ALLOWED"
      );
    }

    // Prevent administrators from deactivating their own account
    if (isOwnAccount && updates.isActive === false) {
      throw new ApiError(
        403,
        "You cannot deactivate your own account",
        "SELF_DEACTIVATION_NOT_ALLOWED"
      );
    }

    // Determine the resulting account state
    const nextRole = updates.role ?? user.role;
    const nextIsActive = updates.isActive ?? user.isActive;

    const removesActiveAdmin =
      user.role === "admin" &&
      user.isActive &&
      (nextRole !== "admin" || !nextIsActive);

    // Protect the last active administrator
    if (removesActiveAdmin) {
      const activeAdminCount = await User.countDocuments({
        role: "admin",
        isActive: true,
      });

      if (activeAdminCount <= 1) {
        throw new ApiError(
          400,
          "The last active administrator cannot be demoted or deactivated",
          "LAST_ACTIVE_ADMIN"
        );
      }
    }

    // Track actual changes
    const previousName = user.name;
    const previousRole = user.role;
    const previousStatus = user.isActive;

    const nameChanged =
      updates.name !== undefined &&
      updates.name !== previousName;

    const roleChanged =
      updates.role !== undefined &&
      updates.role !== previousRole;

    const statusChanged =
      updates.isActive !== undefined &&
      updates.isActive !== previousStatus;

    // Apply updates
    if (nameChanged) {
      user.name = updates.name!;
    }

    if (roleChanged) {
      user.role = updates.role!;
    }

    if (statusChanged) {
      user.isActive = updates.isActive!;
    }

    if (nameChanged || roleChanged || statusChanged) {
      await user.save();
    }

    // Record profile update
    if (nameChanged) {
      await createActivityLog({
        userId: targetUserId,
        performedBy: adminId,
        action: "USER_PROFILE_UPDATED",
        description: "User name was updated by an administrator",
        metadata: {
          previousName,
          newName: user.name,
        },
      });
    }

    // Record role change
    if (roleChanged) {
      await createActivityLog({
        userId: targetUserId,
        performedBy: adminId,
        action: "USER_ROLE_CHANGED",
        description: `User role changed from ${previousRole} to ${user.role}`,
        metadata: {
          previousRole,
          newRole: user.role,
        },
      });
    }

    // Record account status change
    if (statusChanged) {
      await createActivityLog({
        userId: targetUserId,
        performedBy: adminId,
        action: "USER_STATUS_CHANGED",
        description: user.isActive
          ? "User account was activated"
          : "User account was deactivated",
        metadata: {
          previousStatus,
          newStatus: user.isActive,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
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



export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const admin = await requireAdmin();
    const adminId = admin._id.toString();

    const { id } = await params;

    // Validate user ID
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid user ID");
    }

    // Prevent deleting your own account
    if (adminId === id) {
      throw new ApiError(400, "You cannot delete your own account");
    }

    await connectDB();

    // Find target user
    const user = await User.findById(id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Prevent deleting the last active admin
    if (user.role === "admin" && user.isActive) {
      const activeAdminCount = await User.countDocuments({
        role: "admin",
        isActive: true,
      });

      if (activeAdminCount <= 1) {
        throw new ApiError(
          400,
          "You cannot delete the last active admin account"
        );
      }
    }

    // Keep details for the audit log
    const deletedUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Delete the user
    await User.findByIdAndDelete(id);

    // Record the deletion without deleting previous activity logs
    await createActivityLog({
      userId: deletedUser.id,
      performedBy: adminId,
      action: "USER_DELETED",
      description: `User account deleted: ${deletedUser.name}`,
      metadata: {
        name: deletedUser.name,
        email: deletedUser.email,
        role: deletedUser.role,
        deletedBy: adminId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User deleted successfully",
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

