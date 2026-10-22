
export default function BlogTableSkeleton() {
  const rows = Array.from({ length: 8 });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1300px] text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {[
                "Blog",
                "Slug",
                "Category",
                "Author",
                "Status",
                "Active",
                "Featured",
                "Sort Order",
                "Views",
                "Published",
                "Created",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {rows.map((_, index) => (
              <tr key={index}>
                {/* Blog */}
                <td className="px-4 py-4">
                  <div className="flex min-w-[260px] items-center gap-3">
                    <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-gray-200" />

                    <div className="min-w-0 space-y-2">
                      <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
                      <div className="h-3 w-48 animate-pulse rounded bg-gray-100" />
                    </div>
                  </div>
                </td>

                {/* Slug */}
                <td className="px-4 py-4">
                  <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
                </td>

                {/* Category */}
                <td className="px-4 py-4">
                  <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100" />
                </td>

                {/* Author */}
                <td className="px-4 py-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
                </td>

                {/* Active */}
                <td className="px-4 py-4">
                  <div className="h-5 w-14 animate-pulse rounded-full bg-gray-200" />
                </td>

                {/* Featured */}
                <td className="px-4 py-4">
                  <div className="h-5 w-20 animate-pulse rounded-full bg-gray-100" />
                </td>

                {/* Sort Order */}
                <td className="px-4 py-4">
                  <div className="h-4 w-8 animate-pulse rounded bg-gray-100" />
                </td>

                {/* Views */}
                <td className="px-4 py-4">
                  <div className="h-4 w-12 animate-pulse rounded bg-gray-100" />
                </td>

                {/* Published */}
                <td className="px-4 py-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                </td>

                {/* Created */}
                <td className="px-4 py-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-100" />
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-100" />
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-100" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
