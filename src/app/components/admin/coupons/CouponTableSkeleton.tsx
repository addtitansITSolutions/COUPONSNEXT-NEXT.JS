export default function CouponTableSkeleton() {
  const rows = Array.from({ length: 8 });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1300px] text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {[
                "Coupon",
                "Slug",
                "Store",
                "Category",
                "Type / Code",
                "Discount",
                "Country",
                "Status",
                "Active",
                "Featured",
                "Verified",
                "Sort Order",
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
                {/* Coupon */}
                <td className="px-4 py-4">
                  <div className="flex min-w-[240px] items-center gap-3">
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

                {/* Store */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-gray-200" />
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                  </div>
                </td>

                {/* Category */}
                <td className="px-4 py-4">
                  <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100" />
                </td>

                {/* Type / Code */}
                <td className="px-4 py-4">
                  <div className="space-y-2">
                    <div className="h-5 w-14 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                  </div>
                </td>

                {/* Discount */}
                <td className="px-4 py-4">
                  <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100" />
                </td>

                {/* Country */}
                <td className="px-4 py-4">
                  <div className="h-4 w-10 animate-pulse rounded bg-gray-100" />
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
                </td>

                {/* Active */}
                <td className="px-4 py-4">
                  <div className="h-5 w-10 animate-pulse rounded-full bg-gray-200" />
                </td>

                {/* Featured */}
                <td className="px-4 py-4">
                  <div className="h-5 w-10 animate-pulse rounded-full bg-gray-100" />
                </td>

                {/* Verified */}
                <td className="px-4 py-4">
                  <div className="h-5 w-10 animate-pulse rounded-full bg-gray-100" />
                </td>

                {/* Sort Order */}
                <td className="px-4 py-4">
                  <div className="h-4 w-8 animate-pulse rounded bg-gray-100" />
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