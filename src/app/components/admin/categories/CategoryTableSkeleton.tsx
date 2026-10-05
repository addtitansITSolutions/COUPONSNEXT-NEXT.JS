export default function CategoryTableSkeleton() {
  const rows = Array.from({ length: 6 });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] border-collapse">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--background)]">
            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--brand-navy)]/45">
              Category
            </th>

            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--brand-navy)]/45">
              Content Types
            </th>

            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--brand-navy)]/45">
              Status
            </th>

            <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-[var(--brand-navy)]/45">
              Featured
            </th>

            <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-[var(--brand-navy)]/45">
             Sort Order
            </th>

            <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-[var(--brand-navy)]/45">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((_, index) => (
            <tr
              key={index}
              className="border-b border-[var(--border)] last:border-b-0"
            >
              {/* Category */}
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-[var(--border)]" />

                  <div className="min-w-0 space-y-2">
                    <div className="h-3.5 w-28 animate-pulse rounded bg-[var(--border)]" />
                    <div className="h-3 w-20 animate-pulse rounded bg-[var(--border)]/70" />
                  </div>
                </div>
              </td>

              {/* Content Types */}
              <td className="px-5 py-4">
                <div className="flex gap-1.5">
                  <div className="h-6 w-14 animate-pulse rounded-lg bg-[var(--border)]" />
                  <div className="h-6 w-16 animate-pulse rounded-lg bg-[var(--border)]" />
                </div>
              </td>

              {/* Status */}
              <td className="px-5 py-4">
                <div className="h-6 w-16 animate-pulse rounded-full bg-[var(--border)]" />
              </td>

              {/* Featured */}
              <td className="px-5 py-4">
                <div className="mx-auto h-5 w-5 animate-pulse rounded bg-[var(--border)]" />
              </td>

              {/* Order */}
              <td className="px-5 py-4">
                <div className="mx-auto h-4 w-6 animate-pulse rounded bg-[var(--border)]" />
              </td>

              {/* Actions */}
              <td className="px-5 py-4">
                <div className="flex justify-end gap-1">
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-[var(--border)]" />
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-[var(--border)]" />
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-[var(--border)]" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}