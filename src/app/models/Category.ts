import mongoose, { Schema, models, model } from "mongoose";

export type CategoryType = "store" | "coupon" | "both";

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  type: CategoryType;
  isActive: boolean;
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

const Category =
  models.Category || model<ICategory>("Category", CategorySchema);

export default Category;