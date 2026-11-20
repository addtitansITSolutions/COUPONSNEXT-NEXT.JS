
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  UserRound,
  BookOpen,
  Star,
} from "lucide-react";

import type { BlogItem } from "./BlogsClient";

interface BlogCardProps {
  blog: BlogItem;
}

function formatDate(date?: string) {
  if (!date) return "Recently published";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently published";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand-purple)]/30 hover:shadow-[0_18px_45px_rgba(30,20,70,0.10)]">

      {/* Featured Image */}
      <Link
        href={`/blogs/${blog.slug}`}
        aria-label={`Read ${blog.title}`}
        className="relative block aspect-[16/10] overflow-hidden bg-[var(--accent-light)]"
      >
        {blog.featuredImage ? (
          <Image
            src={blog.featuredImage}
            alt={blog.featuredImageAlt || blog.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--brand-navy)] to-[var(--brand-purple)]">
            <BookOpen
              className="h-12 w-12 text-white/70"
              strokeWidth={1.2}
            />
          </div>
        )}

        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-70" />

        {/* Featured Ribbon - Top Left */}
        {blog.isFeatured && (
          <div className="absolute left-0 top-0 flex items-stretch">
            <span className="flex items-center gap-1.5 bg-[var(--brand-yellow)] py-2 pl-4 pr-2 text-[9px] font-extrabold uppercase tracking-wider text-[var(--brand-navy)] shadow-sm sm:text-[10px]">
              <Star size={12} fill="currentColor" />
              Featured
            </span>

            <svg
              className="w-5 shrink-0 self-stretch"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0 0 H100 C50 0, 95 100, 0 100 Z"
                fill="var(--brand-yellow)"
              />
            </svg>
          </div>
        )}

        {/* Category Ribbon - Bottom Right */}
        {blog.category?.name && (
          <div className="absolute bottom-0 right-0 flex max-w-[85%] items-stretch">
            <svg
              className="w-5 shrink-0 self-stretch"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M100 100 H0 C50 100, 5 0, 100 0 Z"
                fill="var(--brand-purple)"
              />
            </svg>

            <span className="min-w-0 truncate bg-[var(--brand-purple)] py-2 pl-2 pr-4 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-sm sm:text-[10px]">
              {blog.category.name}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">

        {/* Meta */}
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-[var(--brand-purple)]" />
            {formatDate(blog.publishedAt || blog.createdAt)}
          </span>

          <span className="inline-flex items-center gap-1.5">
            <UserRound className="h-3.5 w-3.5 text-[var(--brand-purple)]" />
            {blog.author?.name || "CouponsNext"}
          </span>
        </div>

        {/* Title */}
        <h2 className="mb-3 line-clamp-2 text-lg font-bold leading-snug tracking-tight text-[var(--brand-navy)] transition-colors duration-300 group-hover:text-[var(--brand-purple)] sm:text-xl">
          <Link href={`/blogs/${blog.slug}`}>
            {blog.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="mb-5 line-clamp-3 text-sm leading-6 text-[var(--muted)]">
          {blog.excerpt}
        </p>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-4">
          <span className="text-xs font-medium text-[var(--muted)]">
            {blog.viewCount.toLocaleString("en-US")} views
          </span>

          <Link
            href={`/blogs/${blog.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-purple)] transition-all duration-300 hover:gap-2.5 hover:text-[var(--accent-hover)]"
          >
            Read article
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
