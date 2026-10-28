import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
}: SectionHeadingProps) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
      <div className="min-w-0">
        <p
          className="text-xs font-bold uppercase tracking-[0.16em] sm:text-sm"
          style={{ color: "var(--brand-purple)" }}
        >
          {eyebrow}
        </p>

        <h2
          className="mt-2 font-heading text-2xl font-extrabold tracking-tight sm:text-3xl"
          style={{ color: "var(--foreground)" }}
        >
          {title}
        </h2>

        {description && (
          <p
            className="mt-2 max-w-2xl text-sm leading-6 sm:text-base"
            style={{ color: "var(--muted)" }}
          >
            {description}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="mb-1 hidden shrink-0 items-center gap-2 text-sm font-bold transition hover:gap-3 sm:inline-flex"
          style={{ color: "var(--brand-purple)" }}
        >
          {linkLabel}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
