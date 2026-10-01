import mongoose, { Schema, models, model } from "mongoose";

export interface IBanner {
  title: string;
  subtitle?: string;
  desktopImage: string;
  mobileImage: string;
  store: mongoose.Types.ObjectId;
  affiliateUrl: string;
  country: string;
  isActive: boolean;
  sortOrder: number;
  startsAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
      maxlength: 150,
    },

    subtitle: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    desktopImage: {
      type: String,
      required: [true, "Desktop banner image is required"],
      trim: true,
    },

    mobileImage: {
      type: String,
      required: [true, "Mobile banner image is required"],
      trim: true,
    },

    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store is required"],
      index: true,
    },

    affiliateUrl: {
      type: String,
      required: [true, "Affiliate URL is required"],
      trim: true,
    },

    country: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      default: "US",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    startsAt: {
      type: Date,
    },

    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

BannerSchema.index({
  country: 1,
  isActive: 1,
  sortOrder: 1,
});

const Banner =
  models.Banner || model<IBanner>("Banner", BannerSchema);

export default Banner;