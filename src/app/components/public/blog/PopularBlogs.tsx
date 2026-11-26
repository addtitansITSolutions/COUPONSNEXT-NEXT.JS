
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Eye,
  Star,
  TrendingUp,
  BookOpen,
} from "lucide-react";

export interface PopularBlog {
  title: string;
  slug: string;
  featuredImage?: string;
  publishedAt?: Date | string;
  category?: {
    name: string;
  };
  viewCount?: number;
  isFeatured?: boolean;
}

interface PopularBlogsProps {
  blogs: PopularBlog[];
  /** Route prefix for blog posts, e.g. "/blogs" -> /blogs/my-post */
  basePath?: string;
  /** Heading shown above the list */
  title?: string;
}

const VISIBLE_BLOGS = 7;
const ITEM_HEIGHT = 90;
const ANIMATION_DURATION = 450;
const ROTATION_INTERVAL = 2000;

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatDate(date?: Date | string) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

// --------------------------------------------------
// Featured Ribbon
// --------------------------------------------------

function FeaturedLabel() {
  return (
    <div className="flex h-5 items-stretch">
      <span className="flex items-center gap-1 rounded-l-sm bg-[var(--brand-yellow)] px-2 text-[9px] font-extrabold uppercase tracking-wider text-[var(--brand-navy)]">
        <Star
          size={10}
          fill="currentColor"
          aria-hidden="true"
        />
        Featured
      </span>

      <svg
        className="h-5 w-3 shrink-0"
        viewBox="0 0 60 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 0 H60 C20 0 20 100 0 100 Z"
          fill="var(--brand-yellow)"
        />
      </svg>
    </div>
  );
}

// --------------------------------------------------
// Category Ribbon
// --------------------------------------------------

function CategoryLabel({ name }: { name: string }) {
  return (
    <div className="flex h-5 min-w-0 max-w-[120px] items-stretch">
      <svg
        className="h-5 w-3 shrink-0"
        viewBox="0 0 60 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M60 100 H0 C40 100 40 0 60 0 Z"
          fill="var(--brand-purple)"
        />
      </svg>

      <span className="min-w-0 truncate rounded-r-sm bg-[var(--brand-purple)] px-2 text-[9px] font-extrabold uppercase leading-5 tracking-wider text-white">
        {name}
      </span>
    </div>
  );
}

// --------------------------------------------------
// Popular Blog Item
// --------------------------------------------------

function PopularBlogItem({
  blog,
  basePath,
}: {
  blog: PopularBlog;
  index: number;
  basePath: string;
}) {
  const date = formatDate(blog.publishedAt);

  return (
    <li
      className="h-24 shrink-0"
      style={{ height: ITEM_HEIGHT }}
    >
      <Link
        href={`${basePath}/${blog.slug}`}
        className={`group flex h-full min-w-0 items-center gap-3 rounded-xl p-2 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--brand-purple)] ${
          blog.isFeatured
            ? "bg-[var(--brand-yellow)]/10 hover:bg-[var(--brand-yellow)]/15"
            : "hover:bg-[var(--background)]"
        }`}
      >
        {/* Thumbnail */}
        <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-lg bg-[var(--accent-light)]">
          {blog.featuredImage ? (
            <Image
              src={blog.featuredImage}
              alt=""
              fill
              unoptimized
              sizes="68px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--brand-navy)] to-[var(--brand-purple)]">
              <BookOpen
                className="h-8 w-8 text-white/70"
                strokeWidth={1.2}
                aria-hidden="true"
              />
            </div>
          )}

          {/* Rank */}
          {/* <span
            aria-label={`Rank ${index + 1}`}
            className="absolute left-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-md bg-[var(--brand-navy)]/85 px-1 text-[10px] font-bold leading-none text-white"
          >
            {index + 1}
          </span> */}
        </div>

        {/* Blog Information */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          {/* Title */}
          <h3 className="truncate text-sm font-semibold leading-tight text-[var(--foreground)] transition-colors group-hover:text-[var(--brand-purple)]">
            {blog.title}
          </h3>

          {/* Labels */}
          {(blog.isFeatured || blog.category?.name) && (
            <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
              {blog.isFeatured && <FeaturedLabel />}

              {blog.category?.name && (
                <CategoryLabel name={blog.category.name} />
              )}
            </div>
          )}

          {/* Date and Views */}
          <div className="flex min-w-0 items-center gap-3 text-[11px] text-[var(--muted)]">
            {date && (
              <span className="truncate">
                {date}
              </span>
            )}

            {typeof blog.viewCount === "number" && (
              <span className="flex shrink-0 items-center gap-1">
                <Eye
                  size={12}
                  aria-hidden="true"
                />
                {compactNumber.format(blog.viewCount)}
                <span className="sr-only">views</span>
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}

// --------------------------------------------------
// Popular Blogs
// --------------------------------------------------

export default function PopularBlogs({
  blogs,
  basePath = "/blogs",
  title = "Popular posts",
}: PopularBlogsProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const shouldRotate = blogs.length > VISIBLE_BLOGS;

  // --------------------------------------------------
  // Infinite Rotation
  // --------------------------------------------------

  useEffect(() => {
    if (!shouldRotate || isPaused) {
      return;
    }

    let animationTimeout: ReturnType<typeof setTimeout> | undefined;

    const interval = setInterval(() => {
      setIsAnimating(true);

      animationTimeout = setTimeout(() => {
        setStartIndex((current) => (current + 1) % blogs.length);
        setIsAnimating(false);
      }, ANIMATION_DURATION);
    }, ROTATION_INTERVAL);

    return () => {
      clearInterval(interval);

      if (animationTimeout) {
        clearTimeout(animationTimeout);
      }
    };
  }, [blogs.length, shouldRotate, isPaused]);

  // --------------------------------------------------
  // Visible Blogs
  // --------------------------------------------------

  const visibleBlogs = shouldRotate
    ? Array.from(
        { length: VISIBLE_BLOGS + 1 },
        (_, index) => blogs[(startIndex + index) % blogs.length]
      )
    : blogs;

  if (!blogs.length) return null;

  return (
    <aside
      aria-labelledby="popular-blogs-heading"
      className="hidden lg:block"
    >
      <div className="sticky top-34 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card,var(--background))] shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-purple)]/10 text-[var(--brand-purple)]">
            <TrendingUp
              size={18}
              aria-hidden="true"
            />
          </span>

          <div className="min-w-0">
            <h2
              id="popular-blogs-heading"
              className="text-base font-bold tracking-tight text-[var(--foreground)]"
            >
              {title}
            </h2>

            <p className="mt-0.5 text-[11px] text-[var(--muted)]">
              Discover what readers love
            </p>
          </div>
        </div>

        {/* Animated Blog List */}
        <div
          className="overflow-hidden p-3"
          style={{
            height: VISIBLE_BLOGS * ITEM_HEIGHT + 68,
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <ol
            className="flex flex-col gap-2"
            style={{
              transform: isAnimating
                ? `translateY(-${ITEM_HEIGHT}px)`
                : "translateY(0)",
              transition: isAnimating
                ? `transform ${ANIMATION_DURATION}ms ease-in-out`
                : "none",
            }}
            aria-live="off"
          >
            {visibleBlogs.map((blog, index) => (
              <PopularBlogItem
                key={`${blog.slug}-${startIndex}-${index}`}
                blog={blog}
                index={shouldRotate
                  ? (startIndex + index) % blogs.length
                  : index}
                basePath={basePath}
              />
            ))}
          </ol>
        </div>
      </div>
    </aside>
  );
}