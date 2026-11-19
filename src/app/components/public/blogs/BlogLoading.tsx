export default function BlogLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white"
        >
          {/* Image Skeleton */}
          <div className="aspect-[16/10] animate-pulse bg-gray-200" />

          {/* Content Skeleton */}
          <div className="p-5 sm:p-6">
            {/* Meta */}
            <div className="mb-4 flex gap-4">
              <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
            </div>

            {/* Title */}
            <div className="mb-3 space-y-2">
              <div className="h-5 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-4/5 animate-pulse rounded bg-gray-200" />
            </div>

            {/* Excerpt */}
            <div className="mb-6 space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
              <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}