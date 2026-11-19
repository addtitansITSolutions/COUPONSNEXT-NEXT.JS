
import { connectDB } from "@/lib/mongodb";

import Blog from "@/models/Blog";
import User from "@/models/User";

import FeaturedBlogsClient, {
  type FeaturedBlogItem,
} from "./FeaturedBlogsClient";

export const dynamic = "force-dynamic";

export default async function FeaturedBlogs() {
  await connectDB();

  const HOMEPAGE_BLOG_LIMIT = 8;
  const now = new Date();

  // Only include blogs written by active authors.
  const activeAuthorIds = await User.distinct("_id", {
    isActive: true,
  });

  const documents = await Blog.find({
    isActive: true,
    isFeatured: true,
    status: "published",
    publishedAt: { $lte: now },
    author: { $in: activeAuthorIds },
  })
    .sort({
      sortOrder: 1,
      publishedAt: -1,
      _id: -1,
    })
    .limit(HOMEPAGE_BLOG_LIMIT)
    .populate({
      path: "author",
      select: "name isActive",
    })
    .populate({
      path: "category",
      select: "name slug isActive contentTypes",
    })
    .select(
      "title slug excerpt featuredImage featuredImageAlt author category tags isFeatured viewCount publishedAt createdAt sortOrder"
    )
    .lean();

  const blogs: FeaturedBlogItem[] = documents.flatMap((blog) => {
    const author = blog.author as unknown as {
      _id: unknown;
      name: string;
    } | null;

    // Skip blogs whose author is missing.
    if (!author) {
      return [];
    }

    const category = blog.category as unknown as {
      _id: unknown;
      name: string;
      slug: string;
      isActive: boolean;
      contentTypes?: string[];
    } | null;

    const validCategory =
      category?.isActive === true &&
      category.contentTypes?.includes("blog") === true
        ? {
            id: String(category._id),
            name: category.name,
            slug: category.slug,
          }
        : undefined;

    return [
      {
        id: String(blog._id),
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt ?? "",
        featuredImage: blog.featuredImage ?? "",
        featuredImageAlt: blog.featuredImageAlt ?? "",

        author: {
          id: String(author._id),
          name: author.name,
        },

        ...(validCategory ? { category: validCategory } : {}),

        tags: blog.tags ?? [],
        isFeatured: blog.isFeatured ?? false,
        viewCount: blog.viewCount ?? 0,

        publishedAt: blog.publishedAt
          ? new Date(blog.publishedAt).toISOString()
          : undefined,

        createdAt: new Date(blog.createdAt).toISOString(),
      },
    ];
  });

  if (blogs.length === 0) return null;

  return <FeaturedBlogsClient blogs={blogs} />;
}