import { ApiError } from "@/lib/errors/ApiError";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function requireAuth() {
  // Get and verify JWT from HttpOnly cookie
  const authPayload = await getAuthUser();

  if (!authPayload) {
    throw new ApiError(
      401,
      "Please log in to continue",
      "UNAUTHORIZED"
    );
  }

  // Check the actual user in MongoDB
  await connectDB();

  const user = await User.findById(authPayload.userId).select(
    "_id name email role isActive"
  );

  if (!user) {
    throw new ApiError(
      401,
      "Your account could not be found",
      "USER_NOT_FOUND"
    );
  }

  // Account may have been disabled after JWT was issued
  if (!user.isActive) {
    throw new ApiError(
      403,
      "Your account has been deactivated",
      "ACCOUNT_DEACTIVATED"
    );
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== "admin") {
    throw new ApiError(
      403,
      "Admin access required",
      "ADMIN_ACCESS_REQUIRED"
    );
  }

  return user;
}