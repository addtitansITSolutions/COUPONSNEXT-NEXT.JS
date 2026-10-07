"use client";

import {
  MoreVertical,
  Pencil,
  Trash2,
  Star,
} from "lucide-react";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  contentTypes: ("store" | "coupon" | "blog")[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type CategoryTableProps = {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

const contentTypeLabels = {
  store: "Store",
  coupon: "Coupon",
  blog: "Blog",
};

export default function CategoryTable({ categories, onEdit, onDelete, }: CategoryTableProps) {
  if (categories.length === 0) {
    return null;
  }

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
          {categories?.map((category) => (
            <tr
              key={category.id}
              className="border-b border-[var(--border)] last:border-b-0 transition hover:bg-[var(--background)]/60"
            >
              {/* Category */}
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  {/* Image */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--accent-light)]">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-[var(--brand-purple)]">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--brand-navy)]">
                      {category.name}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-[var(--brand-navy)]/45">
                      /{category.slug}
                    </p>
                  </div>
                </div>
              </td>

              {/* Content Types */}
              <td className="px-5 py-4">
                <div className="flex flex-wrap gap-1.5">
                  {category?.contentTypes?.map((type) => (
                    <span
                      key={type}
                      className="inline-flex rounded-lg bg-[var(--accent-light)] px-2.5 py-1 text-xs font-medium text-[var(--brand-purple)]"
                    >
                      {contentTypeLabels[type]}
                    </span>
                  ))}
                </div>
              </td>

              {/* Status */}
              <td className="px-5 py-4">
                <span
                  className={`
                    inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
                    text-xs font-semibold
                    ${
                      category.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }
                  `}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      category.isActive
                        ? "bg-emerald-500"
                        : "bg-gray-400"
                    }`}
                  />

                  {category.isActive ? "Active" : "Inactive"}
                </span>
              </td>

              {/* Featured */}
              <td className="px-5 py-4 text-center">
                {category.isFeatured ? (
                  <Star
                    size={18}
                    fill="currentColor"
                    className="mx-auto text-[var(--brand-yellow)]"
                  />
                ) : (
                  <Star
                    size={18}
                    className="mx-auto text-[var(--brand-navy)]/20"
                  />
                )}
              </td>

              {/* Sort Order */}
              <td className="px-5 py-4 text-center">
                <span className="text-sm font-medium text-[var(--brand-navy)]/65">
                  {category.sortOrder}
                </span>
              </td>

              {/* Actions */}
              <td className="px-5 py-4">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(category)}
                    aria-label={`Edit ${category.name}`}
                    className="rounded-lg p-2 text-[var(--brand-navy)]/50 transition hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)]"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(category)}
                    aria-label={`Delete ${category.name}`}
                    className="rounded-lg p-2 text-[var(--brand-navy)]/50 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={17} />
                  </button>

                  <button
                    type="button"
                    aria-label={`More actions for ${category.name}`}
                    className="rounded-lg p-2 text-[var(--brand-navy)]/50 transition hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)]"
                  >
                    <MoreVertical size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}