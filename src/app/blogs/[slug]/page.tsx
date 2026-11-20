import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

import "@/models/User";
import "@/models/Category";

import PublicHeader from "@/components/public/layout/PublicHeader";
import PublicFooter from "@/components/public/layout/PublicFooter";

import BlogBreadcrumb from "@/components/public/blog/BlogBreadcrumb";
import BlogDetails from "@/components/public/blog/BlogDetails";
import PopularBlogs, {
  type PopularBlog,
} from "@/components/public/blog/PopularBlogs";
import RelatedBlogs, {
  type RelatedBlogItem,
} from "@/components/public/blog/RelatedBlogs";

import type { IBlogContent } from "@/models/Blog";

// --------------------------------------------------
// Types
// --------------------------------------------------

interface PopulatedAuthor {
  _id: mongoose.Types.ObjectId;
  name: string;
}

interface PopulatedCategory {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
}

interface PopulatedBlog {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: IBlogContent;
  featuredImage?: string;
  featuredImageAlt?: string;
  author: PopulatedAuthor;
  category?: PopulatedCategory | null;
  tags: string[];
  status: string;
  isActive: boolean;
  noIndex: boolean;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  publishedAt?: Date;
  updatedAt: Date;
  createdAt: Date;
}

type RelatedPopulatedBlog = {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  author: PopulatedAuthor | null;
  category?: PopulatedCategory | null;
  tags: string[];
  isFeatured: boolean;
  viewCount: number;
  publishedAt?: Date;
  createdAt: Date;
};

type PopularPopulatedBlog = {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  featuredImage?: string;
  category?: Pick<PopulatedCategory, "_id" | "name" | "slug"> | null;
  viewCount: number;
  isFeatured?: boolean;
  publishedAt?: Date;
};

interface BlogPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// --------------------------------------------------
// Constants
// --------------------------------------------------

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://couponsnext.com"
).replace(/\/$/, "");

const POPULAR_BLOGS_LIMIT = 20;

// --------------------------------------------------
// Fetch Single Blog
// --------------------------------------------------

const getBlog = cache(
  async (slug: string): Promise<PopulatedBlog | null> => {
    await connectDB();

    const blog = await Blog.findOne({
      slug,
      status: "published",
      isActive: true,
      publishedAt: { $lte: new Date() },
    })
      .populate({
        path: "author",
        select: "name",
        match: { isActive: true },
      })
      .populate({
        path: "category",
        select: "name slug",
        match: { isActive: true },
      })
      .lean();

    if (!blog) {
      return null;
    }

    // Populate can return null when the author is missing or inactive.
    const result = blog as unknown as Omit<PopulatedBlog, "author"> & {
      author: PopulatedAuthor | null;
    };

    if (!result.author) {
      return null;
    }

    return {
      ...result,
      author: result.author,
    };
  }
);

// --------------------------------------------------
// SEO Metadata
// --------------------------------------------------

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;

  const blog = await getBlog(slug);

  if (!blog) {
    return {
      title: "Blog Not Found | CouponsNext",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl = blog.canonicalUrl || `${SITE_URL}/blogs/${blog.slug}`;
  const title = blog.seoTitle || blog.title;
  const description = blog.seoDescription || blog.excerpt;
  const image = blog.ogImage || blog.featuredImage;
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: !blog.noIndex,
      follow: true,
    },
    openGraph: {
      type: "article",
      title: blog.ogTitle || title,
      description: blog.ogDescription || description,
      url: canonicalUrl,
      siteName: "CouponsNext",
      publishedTime: blog.publishedAt?.toISOString(),
      modifiedTime: blog.updatedAt?.toISOString(),
      authors: [blog.author.name],
      images: image
        ? [
            {
              url: image,
              alt: blog.featuredImageAlt || blog.title,
            },
          ]
        : [],
    },

    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: blog.ogTitle || title,
      description: blog.ogDescription || description,
      images: image ? [image] : [],
    },
  };
}

// --------------------------------------------------
// Single Blog Page
// --------------------------------------------------

export default async function SingleBlogPage({
  params,
}: BlogPageProps) {
  const { slug } = await params;

  const blog = await getBlog(slug);

    if (!blog) {
      notFound();
    }

    // --------------------------------------------------
    // Increment Blog View Count
    // --------------------------------------------------

    await Blog.updateOne(
      {
        _id: blog._id,
      },
      {
        $inc: {
          viewCount: 1,
        },
      }
    );

  // --------------------------------------------------
  // Popular Blogs (sidebar) — ordered by viewCount
  // --------------------------------------------------

  const popularDocuments = (await Blog.find({
    _id: { $ne: blog._id },
    status: "published",
    isActive: true,
    publishedAt: { $lte: new Date() },
  })
    .select(
      "title slug featuredImage category viewCount isFeatured publishedAt"
    )
    .populate({
      path: "category",
      select: "name slug",
      match: { isActive: true },
    })
    .sort({
      viewCount: -1,
      publishedAt: -1,
      _id: -1,
    })
    .limit(POPULAR_BLOGS_LIMIT)
    .lean()) as unknown as PopularPopulatedBlog[];

  const popularBlogs: PopularBlog[] = popularDocuments.map((popular) => ({
    title: popular.title,
    slug: popular.slug,
    featuredImage: popular.featuredImage,
    publishedAt: popular.publishedAt?.toISOString(),
    category: popular.category ? { name: popular.category.name } : undefined,
    viewCount: popular.viewCount ?? 0,
    isFeatured: Boolean(popular.isFeatured),
  }));

  // --------------------------------------------------
  // Related Blogs
  // --------------------------------------------------

  const relatedQuery: Record<string, unknown> = {
    _id: { $ne: blog._id },
    status: "published",
    isActive: true,
    publishedAt: { $lte: new Date() },
  };

  // Prefer blogs from the same category.
  if (blog.category?._id) {
    relatedQuery.category = blog.category._id;
  }

  let relatedDocuments = (await Blog.find(relatedQuery)
    .populate({
      path: "author",
      select: "name",
      match: { isActive: true },
    })
    .populate({
      path: "category",
      select: "name slug",
      match: { isActive: true },
    })
    .sort({
      isFeatured: -1,
      sortOrder: 1,
      publishedAt: -1,
      _id: -1,
    })
    .limit(8)
    .lean()) as unknown as RelatedPopulatedBlog[];

  // Remove blogs with missing or inactive authors.
  relatedDocuments = relatedDocuments.filter(
    (item) => item.author !== null
  );

  // If there are not enough articles in the same category,
  // fill the remaining slots with other recent articles.
  if (relatedDocuments.length < 4) {
    const existingIds = relatedDocuments.map((item) => item._id);

    const additionalBlogs = (await Blog.find({
      _id: {
        $nin: [blog._id, ...existingIds],
      },
      status: "published",
      isActive: true,
      publishedAt: { $lte: new Date() },
    })
      .populate({
        path: "author",
        select: "name",
        match: { isActive: true },
      })
      .populate({
        path: "category",
        select: "name slug",
        match: { isActive: true },
      })
      .sort({
        isFeatured: -1,
        sortOrder: 1,
        publishedAt: -1,
        _id: -1,
      })
      .limit(3 - relatedDocuments.length)
      .lean()) as unknown as RelatedPopulatedBlog[];

    const validAdditionalBlogs = additionalBlogs.filter(
      (item) => item.author !== null
    );

    relatedDocuments = [
      ...relatedDocuments,
      ...validAdditionalBlogs,
    ];
  }

  // Map database documents to RelatedBlogItem.
  const relatedBlogs: RelatedBlogItem[] = relatedDocuments.map(
    (related) => ({
      id: related._id.toString(),
      title: related.title,
      slug: related.slug,
      excerpt: related.excerpt,

      featuredImage: related.featuredImage,
      featuredImageAlt: related.featuredImageAlt,

      author: {
        id: related.author!._id.toString(),
        name: related.author!.name,
      },

      category: related.category
        ? {
            id: related.category._id.toString(),
            name: related.category.name,
            slug: related.category.slug,
          }
        : undefined,

      tags: related.tags || [],
      isFeatured: related.isFeatured,
      viewCount: related.viewCount,

      publishedAt: related.publishedAt?.toISOString(),
      createdAt: related.createdAt.toISOString(),
    })
  );

  // --------------------------------------------------
  // Structured Data
  // --------------------------------------------------

  const canonicalUrl = blog.canonicalUrl || `${SITE_URL}/blogs/${blog.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: blog.excerpt,
    image:
      blog.ogImage || blog.featuredImage
        ? [blog.ogImage || blog.featuredImage]
        : undefined,

    author: {
      "@type": "Person",
      name: blog.author.name,
    },

    publisher: {
      "@type": "Organization",
      name: "CouponsNext",
      url: SITE_URL,
    },

    datePublished: blog.publishedAt?.toISOString(),
    dateModified: blog.updatedAt.toISOString(),

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",

    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blogs",
        item: `${SITE_URL}/blogs`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: blog.title,
        item: canonicalUrl,
      },
    ],
  };

  // --------------------------------------------------
  // Render Page
  // --------------------------------------------------

  return (
    <>
      <PublicHeader />

      {/* Article Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      <main className="min-h-screen bg-[var(--background)]">
        <BlogBreadcrumb title={blog.title} />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* Main column */}
            <div className="min-w-0">
              <BlogDetails
                title={blog.title}
                excerpt={blog.excerpt}
                content={blog.content}
                featuredImage={blog.featuredImage}
                featuredImageAlt={blog.featuredImageAlt}
                author={{ name: blog.author.name }}
                category={
                  blog.category
                    ? {
                        name: blog.category.name,
                        slug: blog.category.slug,
                      }
                    : undefined
                }
                publishedAt={blog.publishedAt}
              />

              {/* Blog Tags */}
              {blog.tags?.length > 0 && (
                <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-6">
                  <span className="mr-1 text-sm font-semibold text-[var(--foreground)]">
                    Tags:
                  </span>

                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar (hidden below lg inside the component) */}
            <PopularBlogs blogs={popularBlogs} basePath="/blogs" />
          </div>

          {/* Related Blogs */}
          {relatedBlogs.length > 0 && (
            <div className="mt-8">
              <RelatedBlogs blogs={relatedBlogs} />
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </>
  );
}