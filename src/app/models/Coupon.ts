import mongoose, { Schema, models, model } from "mongoose";

export type CouponType = "code" | "deal";
export type CouponStatus = "draft" | "published" | "expired";

export interface ICoupon {
  title: string;
  slug: string;
  description: string;
  type: CouponType;
  code?: string;
  image: string;
  store: mongoose.Types.ObjectId;
  category?: mongoose.Types.ObjectId;
  discount?: string;
  affiliateUrl?: string;
  country: string;
  startsAt?: Date;
  expiresAt?: Date;
  status: CouponStatus;
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
      required: true,
    },

    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 100,
      required: function (this: ICoupon) {
        return this.type === "code";
      },
    },

    image: {
      type: String,
      required: [true, "Coupon image is required"],
      trim: true,
    },

    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store is required"],
      index: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },

    discount: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    affiliateUrl: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      default: "IN",
      index: true,
    },

    startsAt: {
      type: Date,
    },

    expiresAt: {
      type: Date,
      index: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "expired"],
      default: "draft",
      required: true,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    isVerified: {
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

CouponSchema.index({
  store: 1,
  country: 1,
  status: 1,
  expiresAt: 1,
});

CouponSchema.index({
  status: 1,
  isFeatured: 1,
  createdAt: -1,
});

const Coupon = models.Coupon || model<ICoupon>("Coupon", CouponSchema);

export default Coupon;