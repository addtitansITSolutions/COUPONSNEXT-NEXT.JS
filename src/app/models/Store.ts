import mongoose, { Schema, models, model } from "mongoose";

export interface IStore {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  storeBanner?: string;
  websiteUrl?: string;
  affiliateUrl?: string;
  country?: string;
  category?: mongoose.Types.ObjectId;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>(
  {
    name: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: [true, "Store slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    logo: {
      type: String,
      trim: true,
    },

    storeBanner: {
      type: String,
      trim: true,
    },

    websiteUrl: {
      type: String,
      trim: true,
    },

    affiliateUrl: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      uppercase: true,
      trim: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Common query indexes
 */

// Admin/public listing by status and manual order
StoreSchema.index({
  isActive: 1,
  sortOrder: 1,
});

// Featured stores ordered manually
StoreSchema.index({
  isFeatured: 1,
  isActive: 1,
  sortOrder: 1,
});

// Store filtering by category and status
StoreSchema.index({
  category: 1,
  isActive: 1,
  sortOrder: 1,
});

// Store filtering by country and status
StoreSchema.index({
  country: 1,
  isActive: 1,
  sortOrder: 1,
});

// Search/sorting by name
StoreSchema.index({
  name: 1,
});

const Store = models.Store || model<IStore>("Store", StoreSchema);

export default Store;