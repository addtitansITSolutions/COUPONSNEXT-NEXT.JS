import mongoose, { Schema, models, model } from "mongoose";

export type BlogStatus = "draft" | "published" | "scheduled";

export interface IBlogContent {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: IBlogContent[];
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
  }>;
  text?: string;
}

export interface IBlog {
  title: string;
  slug: string;
  excerpt: string;
  content: IBlogContent;
  featuredImage?: string;
  featuredImageAlt?: string;
  author: mongoose.Types.ObjectId;
  category?: mongoose.Types.ObjectId;
  tags: string[];
  status: BlogStatus;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  viewCount: number;
  publishedAt?: Date;
  scheduledAt?: Date;

  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  noIndex: boolean;

  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;

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
      maxlength: 200,
    },

    excerpt: {
      type: String,
      required: [true, "Blog excerpt is required"],
      trim: true,
      maxlength: 500,
    },

    content: {
      type: Schema.Types.Mixed,
      required: [true, "Blog content is required"],
    },

    featuredImage: {
      type: String,
      trim: true,
      default: undefined,
    },

    featuredImageAlt: {
      type: String,
      trim: true,
      maxlength: 250,
      default: undefined,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Blog author is required"],
      index: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: undefined,
      index: true,
    },

    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) =>
          tags.length <= 20 &&
          tags.every((tag) => tag.trim().length > 0),
        message: "A blog can have at most 20 non-empty tags",
      },
    },

    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
      required: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    publishedAt: {
      type: Date,
      default: undefined,
    },

    scheduledAt: {
      type: Date,
      default: undefined,
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
      maxlength: 2048,
    },

    noIndex: {
      type: Boolean,
      default: false,
    },

    ogTitle: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    ogDescription: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    ogImage: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Public blog listing and archive queries
BlogSchema.index({
  status: 1,
  isActive: 1,
  publishedAt: -1,
});

// Featured blog queries
BlogSchema.index({
  status: 1,
  isActive: 1,
  isFeatured: 1,
  publishedAt: -1,
});

// Admin ordering
BlogSchema.index({
  sortOrder: 1,
  createdAt: -1,
});

const Blog = models.Blog || model<IBlog>("Blog", BlogSchema);

export default Blog;