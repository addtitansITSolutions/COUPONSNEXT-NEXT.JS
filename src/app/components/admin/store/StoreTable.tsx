"use client";

import {
  ExternalLink,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";

import type { Store } from "@/lib/hooks/useStores";

interface StoreTableProps {
  stores: Store[];
  onEdit: (store: Store) => void;
  onDelete: (store: Store) => void;
  onToggleActive: (store: Store) => void;
  onToggleFeatured: (store: Store) => void;
  actionLoadingId?: string | null;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function truncateUrl(url?: string) {
  if (!url) return "—";

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.replace(/^www\./, "");
  } catch {
    return url.length > 30 ? `${url.slice(0, 30)}...` : url;
  }
}

export default function StoreTable({
  stores,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
  actionLoadingId,
}: StoreTableProps) {
  return (
    <div className="overflow-hidden rounded-xl rounded-b-[0px] border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[1200px] w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Store
              </th>

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Slug
              </th>

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Category
              </th>

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Country
              </th>

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Website
              </th>

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Affiliate
              </th>

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Featured
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Sort Order
              </th>

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Created
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {stores.map((store) => {
              const isActionLoading =
                actionLoadingId === store.id;

              return (
                <tr
                  key={store.id}
                  className="transition hover:bg-gray-50/70"
                >
                  {/* Store */}
                  <td className="px-4 py-4">
                    <div className="flex min-w-[220px] items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        {store.logo ? (
                          <img
                            src={store.logo}
                            alt={`${store.name} logo`}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-gray-400">
                            {store.name
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {store.name}
                        </p>

                        <p className="mt-0.5 max-w-[180px] truncate text-xs text-gray-500">
                          {store.description || "No description"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="px-4 py-4">
                    <span className="whitespace-nowrap text-sm text-gray-600">
                      /store/{store.slug}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-4">
                    {store.category ? (
                      <span className="inline-flex whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {store.category.name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">
                        —
                      </span>
                    )}
                  </td>

                  {/* Country */}
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-gray-700">
                      {store.country || "—"}
                    </span>
                  </td>

                  {/* Website */}
                  <td className="px-4 py-4">
                    {store.websiteUrl ? (
                      <a
                        href={store.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={store.websiteUrl}
                        className="inline-flex max-w-[150px] items-center gap-1.5 text-sm text-[var(--brand-purple)] hover:underline"
                      >
                        <span className="truncate">
                          {truncateUrl(store.websiteUrl)}
                        </span>

                        <ExternalLink
                          size={13}
                          className="shrink-0"
                        />
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">
                        —
                      </span>
                    )}
                  </td>

                  {/* Affiliate */}
                  <td className="px-4 py-4">
                    {store.affiliateUrl ? (
                      <a
                        href={store.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={store.affiliateUrl}
                        className="inline-flex max-w-[150px] items-center gap-1.5 text-sm text-[var(--brand-purple)] hover:underline"
                      >
                        <span className="truncate">
                          {truncateUrl(store.affiliateUrl)}
                        </span>

                        <ExternalLink
                          size={13}
                          className="shrink-0"
                        />
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">
                        —
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => onToggleActive(store)}
                      disabled={isActionLoading}
                      title={
                        store.isActive
                          ? "Click to deactivate"
                          : "Click to activate"
                      }
                      className="disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                          store.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {store.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </button>
                  </td>

                  {/* Featured */}
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => onToggleFeatured(store)}
                      disabled={isActionLoading}
                      title={
                        store.isFeatured
                          ? "Remove from featured"
                          : "Mark as featured"
                      }
                      className="disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                          store.isFeatured
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Star
                          size={13}
                          className={
                            store.isFeatured
                              ? "fill-current"
                              : ""
                          }
                        />

                        {store.isFeatured
                          ? "Featured"
                          : "Not featured"}
                      </span>
                    </button>
                  </td>

                  {/* Sort Order */}
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-gray-700">
                      {store.sortOrder}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="px-4 py-4">
                    <span className="whitespace-nowrap text-sm text-gray-600">
                      {formatDate(store.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(store)}
                        disabled={isActionLoading}
                        title="Edit store"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(store)}
                        disabled={isActionLoading}
                        title="Delete store"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}