
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import ActivityLog, {
  type ActivityAction,
} from "@/models/ActivityLog";

interface CreateActivityLogParams {
  userId: string | mongoose.Types.ObjectId;
  performedBy?: string | mongoose.Types.ObjectId | null;
  action: ActivityAction;
  description: string;
  metadata?: Record<string, unknown>;
}

export async function createActivityLog({
  userId,
  performedBy = null,
  action,
  description,
  metadata = {},
}: CreateActivityLogParams): Promise<void> {
  try {
    if (!mongoose.isValidObjectId(userId)) {
      console.error("Activity log skipped: Invalid user ID.");
      return;
    }

    if (
      performedBy !== null &&
      !mongoose.isValidObjectId(performedBy)
    ) {
      console.error("Activity log skipped: Invalid performer ID.");
      return;
    }

    await connectDB();

    await ActivityLog.create({
      user: new mongoose.Types.ObjectId(userId),
      performedBy: performedBy
        ? new mongoose.Types.ObjectId(performedBy)
        : null,
      action,
      description,
      metadata,
    });
  } catch (error) {
    // Activity logging should not interrupt the main application action.
    console.error("Failed to create activity log:", error);
  }
}




// This is how we will use 
// await createActivityLog({
//   userId: user._id,
//   performedBy: user._id,
//   action: "USER_REGISTERED",
//   description: "New user registered",
// });



// await createActivityLog({
//   userId: targetUser._id,
//   performedBy: admin._id,
//   action: "USER_STATUS_CHANGED",
//   description: "User account was deactivated",
//   metadata: {
//     previousStatus: true,
//     newStatus: false,
//   },
// });