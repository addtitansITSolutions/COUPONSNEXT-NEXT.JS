import mongoose, { Schema, models, model } from "mongoose";

export type CategoryType = "store" | "coupon" | "both";

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  type: CategoryType;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    image: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      enum: ["store", "coupon", "both"],
      default: "both",
      required: true,
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
CategorySchema.index({
  isActive: 1,
  sortOrder: 1,
});

// Featured categories
CategorySchema.index({
  isFeatured: 1,
  isActive: 1,
  sortOrder: 1,
});

// Category filtering by type
CategorySchema.index({
  type: 1,
  isActive: 1,
  sortOrder: 1,
});

// Search/sorting by name
CategorySchema.index({
  name: 1,
});

const Category =
  models.Category || model<ICategory>("Category", CategorySchema);

export default Category;