export default function StoreTableSkeleton() {
  const rows = Array.from({ length: 8 });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[1200px] w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {[
                "Store",
                "Slug",
                "Category",
                "Country",
                "Website",
                "Affiliate",
                "Status",
                "Featured",
                "Order",
                "Created",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {rows.map((_, index) => (
              <tr key={index}>
                {/* Store */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />

                    <div className="space-y-2">
                      <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                      <div className="h-3 w-36 animate-pulse rounded bg-gray-100" />
                    </div>
                  </div>
                </td>

                {/* Slug */}
                <td className="px-4 py-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                </td>

                {/* Category */}
                <td className="px-4 py-4">
                  <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
                </td>

                {/* Country */}
                <td className="px-4 py-4">
                  <div className="h-4 w-8 animate-pulse rounded bg-gray-100" />
                </td>

                {/* Website */}
                <td className="px-4 py-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                </td>

                {/* Affiliate */}
                <td className="px-4 py-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
                </td>

                {/* Featured */}
                <td className="px-4 py-4">
                  <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100" />
                </td>

                {/* Order */}
                <td className="px-4 py-4">
                  <div className="h-4 w-6 animate-pulse rounded bg-gray-100" />
                </td>

                {/* Created */}
                <td className="px-4 py-4">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="ml-auto flex justify-end gap-1">
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