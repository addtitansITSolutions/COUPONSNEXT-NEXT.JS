
import {
  Search,
  SearchX,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface SearchEmptyStateProps {
  type: "initial" | "empty" | "error";
  query?: string;
  message?: string;
  onRetry?: () => void;
}

export default function SearchEmptyState({
  type,
  query,
  message,
  onRetry,
}: SearchEmptyStateProps) {
  const content = {
    initial: {
      icon: Search,
      title: "What are you looking for?",
      description:
        "Search for your favorite stores, exclusive coupons, deals, blogs, and categories.",
    },
    empty: {
      icon: SearchX,
      title: "No results found",
      description:
        "We couldn't find anything matching your search. Try different keywords or check your spelling.",
    },
    error: {
      icon: AlertCircle,
      title: "Something went wrong",
      description:
        message || "We couldn't complete your search. Please try again.",
    },
  };

  const current = content[type];
  const Icon = current.icon;

  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center sm:py-20">
      {/* Icon */}
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--accent-light)]">
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-[var(--brand-yellow)]">
          <Sparkles size={13} className="text-[var(--brand-navy)]" />
        </div>

        <Icon
          size={34}
          strokeWidth={1.7}
          className="text-[var(--brand-purple)]"
        />
      </div>

      {/* Text */}
      <h2 className="text-xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-2xl">
        {current.title}
      </h2>

      <p className="mt-3 max-w-md text-sm leading-7 text-[var(--muted)]">
        {type === "empty" && query ? (
          <>
            No matches for{" "}
            <span className="font-semibold text-[var(--foreground)]">
              &quot;{query}&quot;
            </span>
            . {current.description}
          </>
        ) : (
          current.description
        )}
      </p>

      {/* Retry */}
      {type === "error" && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[var(--brand-purple)] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          <Search size={16} />
          Try again
        </button>
      )}
    </div>
  );
}
