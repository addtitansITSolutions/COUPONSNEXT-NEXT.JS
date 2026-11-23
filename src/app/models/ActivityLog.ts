
import mongoose, { Schema, models, model } from "mongoose";

export type ActivityAction =
  | "USER_REGISTERED"
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER_PROFILE_UPDATED"
  | "USER_PASSWORD_CHANGED"
  | "USER_ROLE_CHANGED"
  | "USER_STATUS_CHANGED"
  | "USER_DELETED";

export interface IActivityLog {
  user: mongoose.Types.ObjectId;
  performedBy?: mongoose.Types.ObjectId | null;
  action: ActivityAction;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    // User whose account is affected by the activity
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // User or admin who performed the activity
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    action: {
      type: String,
      enum: [
        "USER_REGISTERED",
        "USER_LOGIN",
        "USER_LOGOUT",
        "USER_PROFILE_UPDATED",
        "USER_PASSWORD_CHANGED",
        "USER_ROLE_CHANGED",
        "USER_STATUS_CHANGED",
        "USER_DELETED",
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);
// User activity history
ActivityLogSchema.index({ user: 1, createdAt: -1 });
// Activities performed by an admin or user
ActivityLogSchema.index({ performedBy: 1, createdAt: -1 });
// Dashboard activity queries
ActivityLogSchema.index({ createdAt: -1 });
// Activity filtering
ActivityLogSchema.index({ action: 1, createdAt: -1 });
const ActivityLog = models.ActivityLog || model<IActivityLog>("ActivityLog", ActivityLogSchema);
export default ActivityLog;




// Understand our data structure
// For example, when an admin deactivates a user, we'll store:
// {
//   "user": "USER_OBJECT_ID",
//   "performedBy": "ADMIN_OBJECT_ID",
//   "action": "USER_STATUS_CHANGED",
//   "description": "User account was deactivated",
//   "metadata": {
//     "previousStatus": true,
//     "newStatus": false
//   }
// }