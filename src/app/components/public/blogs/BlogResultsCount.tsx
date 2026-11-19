interface BlogResultsCountProps {
  total: number;
  loading?: boolean;
}

export default function BlogResultsCount({
  total,
  loading = false,
}: BlogResultsCountProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-[var(--muted)]">
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-3.5 w-24 animate-pulse rounded bg-gray-200" />
            <span>articles</span>
          </span>
        ) : (
          <>
            Showing{" "}
            <span className="font-semibold text-[var(--brand-navy)]">
              {total.toLocaleString("en-US")}
            </span>{" "}
            {total === 1 ? "article" : "articles"}
          </>
        )}
      </p>

      <span className="hidden text-xs font-medium text-[var(--muted)] sm:block">
        Discover something worth reading
      </span>
    </div>
  );
}