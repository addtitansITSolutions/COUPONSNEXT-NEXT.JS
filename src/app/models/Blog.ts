import mongoose, { Schema, models, model } from "mongoose";

export type BlogStatus = "draft" | "published" | "scheduled";

export interface IBlog {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: mongoose.Types.ObjectId;
  category?: mongoose.Types.ObjectId;
  tags: string[];
  status: BlogStatus;
  isFeatured: boolean;
  publishedAt?: Date;
  scheduledAt?: Date;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: [true, "Blog slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    excerpt: {
      type: String,
      required: [true, "Blog excerpt is required"],
      trim: true,
      maxlength: 500,
    },

    content: {
      type: String,
      required: [true, "Blog content is required"],
    },

    featuredImage: {
      type: String,
      required: [true, "Featured image is required"],
      trim: true,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Blog author is required"],
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },

    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length <= 20,
        message: "A blog can have at most 20 tags",
      },
    },

    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
      required: true,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    publishedAt: {
      type: Date,
    },

    scheduledAt: {
      type: Date,
    },

    seoTitle: {
      type: String,
      trim: true,
      maxlength: 70,
    },

    seoDescription: {
      type: String,
      trim: true,
      maxlength: 170,
    },

    canonicalUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

BlogSchema.index({
  status: 1,
  publishedAt: -1,
});

BlogSchema.index({
  status: 1,
  isFeatured: 1,
  publishedAt: -1,
});

const Blog =
  models.Blog || model<IBlog>("Blog", BlogSchema);

export default Blog;