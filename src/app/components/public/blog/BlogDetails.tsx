// import React from "react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   CalendarDays,
//   Clock3,
//   UserRound,
// } from "lucide-react";

// import type { IBlogContent } from "@/models/Blog";

// interface BlogDetailsProps {
//   title: string;
//   excerpt: string;
//   content: IBlogContent;
//   featuredImage?: string;
//   featuredImageAlt?: string;
//   author: {
//     name: string;
//     image?: string;
//   };
//   category?: {
//     name: string;
//     slug: string;
//   };
//   publishedAt?: Date | string;
// }

// function formatDate(date?: Date | string) {
//   if (!date) return "";

//   return new Intl.DateTimeFormat("en", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   }).format(new Date(date));
// }

// function getTextContent(node: IBlogContent): string {
//   let text = node.text || "";

//   if (node.content) {
//     text += node.content.map(getTextContent).join(" ");
//   }

//   return text;
// }

// function renderMarks(
//   text: React.ReactNode,
//   marks?: IBlogContent["marks"]
// ) {
//   if (!marks?.length) return text;

//   return marks.reduce<React.ReactNode>((result, mark) => {
//     switch (mark.type) {
//       case "bold":
//         return <strong>{result}</strong>;

//       case "italic":
//         return <em>{result}</em>;

//       case "underline":
//         return <u>{result}</u>;

//       case "strike":
//       case "strikethrough":
//         return <s>{result}</s>;

//       case "link": {
//         const href = mark.attrs?.href;

//         if (typeof href !== "string") return result;

//         return (
//           <Link
//             href={href}
//             target={href.startsWith("http") ? "_blank" : undefined}
//             rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
//             className="text-[var(--brand-purple)] underline underline-offset-4 hover:text-[var(--accent-hover)]"
//           >
//             {result}
//           </Link>
//         );
//       }

//       case "code":
//         return (
//           <code className="rounded-md bg-[var(--background)] px-1.5 py-0.5 text-sm">
//             {result}
//           </code>
//         );

//       case "highlight":
//         return (
//           <mark className="rounded bg-[var(--brand-yellow)]/30 px-1">
//             {result}
//           </mark>
//         );

//       default:
//         return result;
//     }
//   }, text);
// }

// function renderInline(node: IBlogContent, index: number): React.ReactNode {
//   if (node.type === "text") {
//     return (
//       <span key={index}>
//         {renderMarks(node.text || "", node.marks)}
//       </span>
//     );
//   }

//   if (node.type === "hardBreak") {
//     return <br key={index} />;
//   }

//   if (node.content) {
//     return node.content.map((child, childIndex) =>
//       renderInline(child, childIndex)
//     );
//   }

//   return null;
// }

// function renderBlock(node: IBlogContent, index: number): React.ReactNode {
//   const children = node.content?.map((child, childIndex) =>
//     renderInline(child, childIndex)
//   );

//   switch (node.type) {
//     case "paragraph":
//       if (!getTextContent(node).trim()) {
//         return <div key={index} className="h-3" />;
//       }

//       return (
//         <p
//           key={index}
//           className="mb-6 text-base leading-8 text-[var(--foreground)]/80 sm:text-[17px]"
//         >
//           {children}
//         </p>
//       );

//     case "heading": {
//       const level = Number(node.attrs?.level) || 2;

//       const headingClasses =
//         "mb-5 mt-10 font-bold tracking-tight text-[var(--foreground)]";

//       if (level === 1) {
//         return (
//           <h2 key={index} className={`${headingClasses} text-3xl`}>
//             {children}
//           </h2>
//         );
//       }

//       if (level === 3) {
//         return (
//           <h3 key={index} className={`${headingClasses} text-xl sm:text-2xl`}>
//             {children}
//           </h3>
//         );
//       }

//       if (level === 4) {
//         return (
//           <h4 key={index} className={`${headingClasses} text-lg sm:text-xl`}>
//             {children}
//           </h4>
//         );
//       }

//       return (
//         <h2 key={index} className={`${headingClasses} text-2xl sm:text-3xl`}>
//           {children}
//         </h2>
//       );
//     }

//     case "bulletList":
//       return (
//         <ul
//           key={index}
//           className="mb-6 ml-6 list-disc space-y-2 text-base leading-8 text-[var(--foreground)]/80"
//         >
//           {node.content?.map((item, itemIndex) => (
//             <React.Fragment key={itemIndex}>
//               {renderBlock(item, itemIndex)}
//             </React.Fragment>
//           ))}
//         </ul>
//       );

//     case "orderedList":
//       return (
//         <ol
//           key={index}
//           className="mb-6 ml-6 list-decimal space-y-2 text-base leading-8 text-[var(--foreground)]/80"
//         >
//           {node.content?.map((item, itemIndex) => (
//             <React.Fragment key={itemIndex}>
//               {renderBlock(item, itemIndex)}
//             </React.Fragment>
//           ))}
//         </ol>
//       );

//     case "listItem":
//       return (
//         <li key={index} className="pl-1">
//           {node.content?.map((child, childIndex) =>
//             renderBlock(child, childIndex)
//           )}
//         </li>
//       );

//     case "blockquote":
//       return (
//         <blockquote
//           key={index}
//           className="my-8 border-l-4 border-[var(--brand-purple)] bg-[var(--brand-purple)]/5 px-6 py-5 text-lg italic leading-8 text-[var(--foreground)]"
//         >
//           {node.content?.map((child, childIndex) =>
//             renderBlock(child, childIndex)
//           )}
//         </blockquote>
//       );

//     case "image": {
//       const src = node.attrs?.src;
//       const alt = node.attrs?.alt;

//       if (typeof src !== "string" || !src) return null;

//       return (
//         <figure key={index} className="my-8">
//           <div className="relative aspect-video overflow-hidden rounded-2xl bg-[var(--background)]">
//             <Image
//               src={src}
//               alt={typeof alt === "string" ? alt : ""}
//               fill
//               sizes="(max-width: 768px) 100vw, 800px"
//               className="object-cover"
//             />
//           </div>

//           {typeof node.attrs?.caption === "string" && (
//             <figcaption className="mt-3 text-center text-sm text-[var(--muted)]">
//               {node.attrs.caption}
//             </figcaption>
//           )}
//         </figure>
//       );
//     }

//     case "horizontalRule":
//       return (
//         <hr
//           key={index}
//           className="my-10 border-[var(--border)]"
//         />
//       );

//     case "codeBlock":
//       return (
//         <pre
//           key={index}
//           className="my-6 overflow-x-auto rounded-xl bg-[var(--brand-navy)] p-5 text-sm leading-7 text-white"
//         >
//           <code>{getTextContent(node)}</code>
//         </pre>
//       );

//     default:
//       if (node.content) {
//         return (
//           <div key={index}>
//             {node.content.map((child, childIndex) =>
//               renderBlock(child, childIndex)
//             )}
//           </div>
//         );
//       }

//       return null;
//   }
// }

// export default function BlogDetails({
//   title,
//   excerpt,
//   content,
//   featuredImage,
//   featuredImageAlt,
//   author,
//   category,
//   publishedAt,
// }: BlogDetailsProps) {
//   const formattedDate = formatDate(publishedAt);

//   const wordCount = getTextContent(content).trim().split(/\s+/).filter(Boolean).length;
//   const readingTime = Math.max(1, Math.ceil(wordCount / 200));

//   return (
//     <article className="min-w-0">
//       {/* Article Header */}
//       <header className="mb-8">
//         {category && (
//           <Link
//             href={`/categories/${category.slug}`}
//             className="mb-5 inline-flex rounded-full bg-[var(--brand-purple)]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--brand-purple)] transition-colors hover:bg-[var(--brand-purple)]/15"
//           >
//             {category.name}
//           </Link>
//         )}

//         <h1 className="mb-5 text-3xl font-extrabold leading-tight tracking-tight text-[var(--foreground)] sm:text-4xl lg:text-5xl">
//           {title}
//         </h1>

//         <p className="max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
//           {excerpt}
//         </p>

//         {/* Author and Meta */}
//         <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4 border-y border-[var(--border)] py-5">
//           <div className="flex items-center gap-3">
//             {author.image ? (
//               <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[var(--background)]">
//                 <Image
//                   src={author.image}
//                   alt={author.name}
//                   fill
//                   sizes="40px"
//                   className="object-cover"
//                 />
//               </div>
//             ) : (
//               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-purple)]/10 text-[var(--brand-purple)]">
//                 <UserRound size={19} />
//               </div>
//             )}

//             <div>
//               <p className="text-xs text-[var(--muted)]">Written by</p>
//               <p className="text-sm font-semibold text-[var(--foreground)]">
//                 {author.name}
//               </p>
//             </div>
//           </div>

//           {formattedDate && (
//             <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
//               <CalendarDays size={16} />
//               <time dateTime={new Date(publishedAt!).toISOString()}>
//                 {formattedDate}
//               </time>
//             </div>
//           )}

//           <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
//             <Clock3 size={16} />
//             <span>{readingTime} min read</span>
//           </div>
//         </div>
//       </header>

//       {/* Featured Image */}
//       {featuredImage && (
//         <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl bg-[var(--background)] sm:rounded-3xl">
//           <Image
//             src={featuredImage}
//             alt={featuredImageAlt || title}
//             fill
//             priority
//             sizes="(max-width: 768px) 100vw, 900px"
//             className="object-cover"
//           />
//         </div>
//       )}

//       {/* Article Content */}
//       <div className="blog-content">
//         {content.content?.map((node, index) =>
//           renderBlock(node, index)
//         )}
//       </div>
//     </article>
//   );
// }




import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, Tag, UserRound } from "lucide-react";

import type { IBlogContent } from "@/models/Blog";

interface BlogDetailsProps {
  title: string;
  excerpt: string;
  content: IBlogContent;
  featuredImage?: string;
  featuredImageAlt?: string;
  author: {
    name: string;
    image?: string;
  };
  category?: {
    name: string;
    slug: string;
  };
  publishedAt?: Date | string;
}

/** Where a block is rendered, so spacing can adapt (e.g. no big margins inside lists). */
type BlockContext = "root" | "list" | "quote";

function formatDate(date?: Date | string) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getTextContent(node: IBlogContent): string {
  let text = node.text || "";

  if (node.content) {
    text += node.content.map(getTextContent).join(" ");
  }

  return text;
}

function renderMarks(text: React.ReactNode, marks?: IBlogContent["marks"]) {
  if (!marks?.length) return text;

  return marks.reduce<React.ReactNode>((result, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong className="font-semibold text-[var(--foreground)]">{result}</strong>;

      case "italic":
        return <em>{result}</em>;

      case "underline":
        return <u className="underline-offset-4">{result}</u>;

      case "strike":
      case "strikethrough":
        return <s>{result}</s>;

      case "link": {
        const href = mark.attrs?.href;

        if (typeof href !== "string") return result;

        const isExternal = href.startsWith("http");

        return (
          <Link
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="font-medium text-[var(--brand-purple)] underline decoration-[var(--brand-purple)]/30 underline-offset-4 transition-colors hover:text-[var(--accent-hover)] hover:decoration-current"
          >
            {result}
          </Link>
        );
      }

      case "code":
        return (
          <code className="rounded-md border border-[var(--border)] bg-[var(--background)] px-1.5 py-0.5 font-mono text-[0.88em]">
            {result}
          </code>
        );

      case "highlight":
        return (
          <mark className="rounded bg-[var(--brand-yellow)]/30 px-1">
            {result}
          </mark>
        );

      default:
        return result;
    }
  }, text);
}

function renderInline(node: IBlogContent, index: number): React.ReactNode {
  if (node.type === "text") {
    return (
      <React.Fragment key={index}>
        {renderMarks(node.text || "", node.marks)}
      </React.Fragment>
    );
  }

  if (node.type === "hardBreak") {
    return <br key={index} />;
  }

  if (node.content) {
    return (
      <React.Fragment key={index}>
        {node.content.map((child, childIndex) => renderInline(child, childIndex))}
      </React.Fragment>
    );
  }

  return null;
}

function renderBlock(
  node: IBlogContent,
  index: number,
  context: BlockContext = "root"
): React.ReactNode {
  const children = node.content?.map((child, childIndex) =>
    renderInline(child, childIndex)
  );

  switch (node.type) {
    case "paragraph": {
      // Empty paragraphs are just editor spacing; margins already handle it.
      if (!getTextContent(node).trim() && !node.content?.some((n) => n.type === "hardBreak")) {
        return null;
      }

      const spacing =
        context === "root" ? "mb-6" : "mb-3 last:mb-0";

      return (
        <p key={index} className={spacing}>
          {children}
        </p>
      );
    }

    case "heading": {
      const level = Number(node.attrs?.level) || 2;
      const base =
        "scroll-mt-28 font-bold tracking-tight text-[var(--foreground)] text-balance";

      if (level === 3) {
        return (
          <h3 key={index} className={`${base} mb-3 mt-9 text-xl sm:text-2xl`}>
            {children}
          </h3>
        );
      }

      if (level >= 4) {
        return (
          <h4 key={index} className={`${base} mb-3 mt-7 text-lg sm:text-xl`}>
            {children}
          </h4>
        );
      }

      // h1 and h2 both render as h2 — the page title is already the h1.
      return (
        <h2
          key={index}
          className={`${base} mb-4 mt-12 border-t border-[var(--border)] pt-8 text-2xl first:mt-0 first:border-t-0 first:pt-0 sm:text-[1.75rem]`}
        >
          {children}
        </h2>
      );
    }

    case "bulletList":
      return (
        <ul
          key={index}
          className="mb-6 ml-5 list-disc space-y-2 pl-1 marker:text-[var(--brand-purple)]"
        >
          {node.content?.map((item, i) => renderBlock(item, i, "list"))}
        </ul>
      );

    case "orderedList":
      return (
        <ol
          key={index}
          className="mb-6 ml-5 list-decimal space-y-2 pl-1 marker:font-semibold marker:text-[var(--brand-purple)]"
        >
          {node.content?.map((item, i) => renderBlock(item, i, "list"))}
        </ol>
      );

    case "listItem":
      return (
        <li key={index} className="pl-1">
          {node.content?.map((child, i) => renderBlock(child, i, "list"))}
        </li>
      );

    case "blockquote":
      return (
        <blockquote
          key={index}
          className="my-8 rounded-r-2xl border-l-4 border-[var(--brand-purple)] bg-[var(--brand-purple)]/5 py-5 pl-6 pr-6 text-lg leading-8 text-[var(--foreground)]"
        >
          {node.content?.map((child, i) => renderBlock(child, i, "quote"))}
        </blockquote>
      );

    case "image": {
      const src = node.attrs?.src;
      const alt = node.attrs?.alt;
      const caption = node.attrs?.caption;

      if (typeof src !== "string" || !src) return null;

      return (
        <figure key={index} className="my-10">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]">
            <Image
              src={src}
              alt={typeof alt === "string" ? alt : ""}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          </div>

          {typeof caption === "string" && caption && (
            <figcaption className="mt-3 text-center text-sm text-[var(--muted)]">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "horizontalRule":
      return <hr key={index} className="my-12 border-[var(--border)]" />;

    case "codeBlock":
      return (
        <pre
          key={index}
          className="my-8 overflow-x-auto rounded-2xl bg-[var(--brand-navy)] p-5 font-mono text-sm leading-7 text-white"
        >
          <code>{getTextContent(node)}</code>
        </pre>
      );

    default:
      if (node.content) {
        return (
          <div key={index}>
            {node.content.map((child, i) => renderBlock(child, i, context))}
          </div>
        );
      }

      return null;
  }
}

export default function BlogDetails({
  title,
  excerpt,
  content,
  featuredImage,
  featuredImageAlt,
  author,
  category,
  publishedAt,
}: BlogDetailsProps) {
  const formattedDate = formatDate(publishedAt);

  const wordCount = getTextContent(content)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <article className="w-full min-w-0">
      {/* Header */}
      <header className="mb-10">
        <h1 className="mb-5 text-balance text-3xl font-extrabold leading-[1.15] tracking-tight text-[var(--foreground)] sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h1>

        <p className="text-pretty text-lg leading-8 text-[var(--muted)] sm:text-xl sm:leading-9">
          {excerpt}
        </p>

        {/* Author + meta */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-y border-[var(--border)] py-5">
          <div className="flex items-center gap-3">
            {author.image ? (
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[var(--background)] ring-2 ring-[var(--border)]">
                <Image
                  src={author.image}
                  alt={author.name}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand-purple)]/10 text-[var(--brand-purple)]">
                <UserRound size={20} aria-hidden="true" />
              </div>
            )}

            <div className="leading-tight">
              <p className="text-xs text-[var(--muted)]">Written by</p>
              <p className="mt-0.5 text-sm font-semibold text-[var(--foreground)]">
                {author.name}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--muted)]">
            {formattedDate && (
              <div className="flex items-center gap-2">
                <CalendarDays size={16} aria-hidden="true" />
                <time dateTime={new Date(publishedAt!).toISOString()}>
                  {formattedDate}
                </time>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Clock3 size={16} aria-hidden="true" />
              <span>{readingTime} min read</span>
            </div>

            {category && (
              <Link
                href={`/categories/${category.slug}`}
                className="flex items-center gap-2 font-medium text-[var(--brand-purple)] transition-colors hover:text-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-purple)]"
              >
                <Tag size={16} aria-hidden="true" />
                {category.name}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Featured image */}
      {featuredImage && (
        <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] sm:rounded-3xl">
          <Image
            src={featuredImage}
            alt={featuredImageAlt || title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      {/* Body */}
      <div className="blog-content text-[1.0625rem] leading-[1.85] text-[var(--foreground)]/85 sm:text-[1.125rem]">
        {content.content?.map((node, index) => renderBlock(node, index))}
      </div>
    </article>
  );
}