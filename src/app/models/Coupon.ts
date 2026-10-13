
import mongoose, { Schema, models, model } from "mongoose";

export type CouponType = "code" | "deal";
export type CouponStatus = "draft" | "published" | "expired";

export interface ICoupon {
  title: string;
  slug: string;
  description: string;
  type: CouponType;
  code?: string;
  image?: string;
  store: mongoose.Types.ObjectId;
  category?: mongoose.Types.ObjectId;
  discount?: string;
  affiliateUrl: string;
  country: string;
  startsAt?: Date;
  expiresAt?: Date;
  status: CouponStatus;
  isActive: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    title: {
      type: String,
      required: [true, "Coupon title is required"],
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: [true, "Coupon slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 220,
    },

    description: {
      type: String,
      required: [true, "Coupon description is required"],
      trim: true,
      maxlength: 2000,
    },

    type: {
      type: String,
      enum: ["code", "deal"],
      required: [true, "Coupon type is required"],
    },

    
    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 100,
      required: function (this: mongoose.Document & ICoupon) {
        return this.type === "code";
      },
    },


    // Optional: the frontend falls back to the referenced store logo.
    image: {
      type: String,
      trim: true,
      default: undefined,
    },

    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store is required"],
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: undefined,
    },

    discount: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    affiliateUrl: {
      type: String,
      required: [true, "Affiliate URL is required"],
      trim: true,
    },

    country: {
      type: String,
      required: [true, "Country is required"],
      uppercase: true,
      trim: true,
      default: "IN",
      minlength: 2,
      maxlength: 2,
    },

    startsAt: {
      type: Date,
      default: undefined,
    },

    expiresAt: {
      type: Date,
      default: undefined,
    },

    status: {
      type: String,
      enum: ["draft", "published", "expired"],
      default: "draft",
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

    isVerified: {
      type: Boolean,
      default: false,
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Sort order must be a whole number.",
      },
    },
  },
  {
    timestamps: true,
  }
);

// 1. Homepage and general public coupon listings.
CouponSchema.index({
  status: 1,
  isActive: 1,
  country: 1,
  sortOrder: 1,
  createdAt: -1,
});

// 2. Featured coupon listings.
CouponSchema.index({
  status: 1,
  isActive: 1,
  country: 1,
  isFeatured: 1,
  sortOrder: 1,
  createdAt: -1,
});

// 3. Coupons belonging to a particular store.
CouponSchema.index({
  store: 1,
  status: 1,
  isActive: 1,
  country: 1,
  sortOrder: 1,
  createdAt: -1,
});

// 4. Coupons belonging to a category.
CouponSchema.index({
  category: 1,
  status: 1,
  isActive: 1,
  country: 1,
  sortOrder: 1,
  createdAt: -1,
});


// 5. Coupons belonging to a specific category within a store.
CouponSchema.index({
  store: 1,
  category: 1,
  status: 1,
  isActive: 1,
  country: 1,
  sortOrder: 1,
  createdAt: -1,
});

const Coupon =
  models.Coupon || model<ICoupon>("Coupon", CouponSchema);

export default Coupon;
