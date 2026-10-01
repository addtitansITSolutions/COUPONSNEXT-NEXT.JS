import mongoose, { Schema, models, model } from "mongoose";

export interface IStore {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  websiteUrl: string;
  affiliateUrl?: string;
  country: string;
  category?: mongoose.Types.ObjectId;
  isActive: boolean;
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
      index: true,
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

    websiteUrl: {
      type: String,
      required: [true, "Store website URL is required"],
      trim: true,
    },

    affiliateUrl: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      required: [true, "Country is required"],
      uppercase: true,
      trim: true,
      default: "IN",
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Store = models.Store || model<IStore>("Store", StoreSchema);

export default Store;