
"use client";

import {
  ExternalLink,
  Image as ImageIcon,
  Pencil,
  Trash2,
} from "lucide-react";

import type { Banner } from "@/lib/hooks/useBanners";

interface BannerTableProps {
  banners: Banner[];
  onEdit: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
  onToggleActive: (banner: Banner) => void;
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

export default function BannerTable({
  banners,
  onEdit,
  onDelete,
  onToggleActive,
  actionLoadingId,
}: BannerTableProps) {
  return (
    <div className="overflow-hidden rounded-xl rounded-b-[0px] border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Banner
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Images
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Store
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Country
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Affiliate
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
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
            {banners.map((banner) => {
              const isActionLoading = actionLoadingId === banner.id;

              return (
                <tr
                  key={banner.id}
                  className="transition hover:bg-gray-50/70"
                >
                  {/* Banner details */}
                  <td className="px-4 py-4">
                    <div className="min-w-[180px]">
                      <p className="max-w-[220px] truncate text-sm font-semibold text-gray-900">
                        {banner.title}
                      </p>

                      <p className="mt-0.5 max-w-[220px] truncate text-xs text-gray-500">
                        {banner.subtitle || "No subtitle"}
                      </p>
                    </div>
                  </td>

                  {/* Desktop and mobile images */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        {banner.desktopImage ? (
                          <img
                            src={banner.desktopImage}
                            alt={`${banner.title} desktop banner`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <ImageIcon size={18} className="text-gray-400" />
                        )}
                      </div>

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        {banner.mobileImage ? (
                          <img
                            src={banner.mobileImage}
                            alt={`${banner.title} mobile banner`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <ImageIcon size={16} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-[10px] text-gray-400">
                      Desktop / Mobile
                    </p>
                  </td>

                  {/* Store */}
                  <td className="px-4 py-4">
                    {banner.store ? (
                      <div className="flex min-w-[150px] items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                          {banner.store.logo ? (
                            <img
                              src={banner.store.logo}
                              alt={`${banner.store.name} logo`}
                              className="h-full w-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-xs font-semibold text-gray-400">
                              {banner.store.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <span className="max-w-[120px] truncate text-sm font-medium text-gray-700">
                          {banner.store.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Store unavailable
                      </span>
                    )}
                  </td>

                  {/* Country */}
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-gray-700">
                      {banner.country || "—"}
                    </span>
                  </td>

                  {/* Affiliate URL */}
                  <td className="px-4 py-4">
                    {banner.affiliateUrl ? (
                      <a
                        href={banner.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={banner.affiliateUrl}
                        className="inline-flex max-w-[150px] items-center gap-1.5 text-sm text-[var(--brand-purple)] hover:underline"
                      >
                        <span className="truncate">
                          {truncateUrl(banner.affiliateUrl)}
                        </span>
                        <ExternalLink size={13} className="shrink-0" />
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>

                  {/* Active status */}
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => onToggleActive(banner)}
                      disabled={isActionLoading}
                      title={
                        banner.isActive
                          ? "Click to deactivate"
                          : "Click to activate"
                      }
                      aria-label={
                        `${banner.isActive ? "Deactivate" : "Activate"} ${banner.title}`
                      }
                      className="disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                          banner.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {banner.isActive ? "Active" : "Inactive"}
                      </span>
                    </button>
                  </td>

                  {/* Sort order */}
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-gray-700">
                      {banner.sortOrder}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="px-4 py-4">
                    <span className="whitespace-nowrap text-sm text-gray-600">
                      {formatDate(banner.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(banner)}
                        disabled={isActionLoading}
                        title="Edit banner"
                        aria-label={`Edit ${banner.title}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(banner)}
                        disabled={isActionLoading}
                        title="Delete banner"
                        aria-label={`Delete ${banner.title}`}
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
