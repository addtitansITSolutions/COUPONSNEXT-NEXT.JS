"use client";

import {
  ExternalLink,
  Pencil,
  Star,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import type { Coupon } from "@/lib/hooks/useCoupons";

interface CouponTableProps {
  coupons: Coupon[];
  onEdit: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
  onToggleActive: (coupon: Coupon) => void;
  onToggleFeatured: (coupon: Coupon) => void;
  onToggleVerified: (coupon: Coupon) => void;
  actionLoadingId?: string | null;
}

function formatDate(date?: string) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function truncateUrl(url?: string) {
  if (!url) return "—";

  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.length > 30 ? `${url.slice(0, 30)}...` : url;
  }
}

export default function CouponTable({
  coupons,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
  onToggleVerified,
  actionLoadingId,
}: CouponTableProps) {
  return (
    <div className="overflow-hidden rounded-xl rounded-b-[0px] border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[1500px] w-full text-left">
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
            {coupons.map((coupon) => {
              const isActionLoading = actionLoadingId === coupon.id;
              const storeName = coupon.store?.name || "No store";
              const categoryName = coupon.category?.name || "No category";

              return (
                <tr
                  key={coupon.id}
                  className="transition hover:bg-gray-50/70"
                >
                  {/* Coupon */}
                  <td className="px-4 py-4">
                    <div className="flex min-w-[240px] items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        {coupon.image || coupon.store?.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={coupon.image || coupon.store?.logo || ""}
                            alt={`${coupon.title} image`}
                            loading="lazy"
                            className="h-full w-full object-contain"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-sm font-semibold uppercase text-gray-400">
                            {(storeName !== "No store"
                              ? storeName
                              : coupon.title
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p
                          title={coupon.title}
                          className="max-w-[240px] truncate text-sm font-semibold text-gray-900"
                        >
                          {coupon.title}
                        </p>

                        <p
                          title={coupon.description || ""}
                          className="mt-0.5 max-w-[240px] truncate text-xs text-gray-500"
                        >
                          {coupon.description || "No description"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="px-4 py-4">
                    <span
                      title={coupon.slug}
                      className="whitespace-nowrap font-mono text-xs text-gray-600"
                    >
                      {coupon.slug}
                    </span>
                  </td>

                  {/* Store */}
                  <td className="px-4 py-4">
                    {coupon.store ? (
                      <div className="flex min-w-[120px] items-center gap-2">
                        {coupon.store.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={coupon.store.logo}
                            alt={`${storeName} logo`}
                            loading="lazy"
                            className="h-8 w-8 shrink-0 rounded-lg border border-gray-100 bg-white object-contain"
                          />
                        ) : (
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold uppercase text-gray-600">
                            {storeName.charAt(0)}
                          </span>
                        )}

                        <div>
                          <p className="max-w-[110px] truncate text-sm font-medium text-gray-800">
                            {storeName}
                          </p>

                          {!coupon.store.isActive && (
                            <p className="mt-0.5 text-xs text-amber-600">
                              Store inactive
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="px-4 py-4">
                    {coupon.category ? (
                      <span className="inline-flex max-w-[150px] truncate whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {categoryName}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>

                  {/* Type / Code */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-start gap-1.5">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                          coupon.type === "code"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {coupon.type === "code" ? "Code coupon" : "Deal"}
                      </span>

                      {coupon.type === "code" && coupon.code ? (
                        <span className="rounded border border-dashed border-gray-300 bg-gray-50 px-2 py-1 font-mono text-xs font-semibold text-gray-700">
                          {coupon.code}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          No code
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Discount */}
                  <td className="px-4 py-4">
                    <span className="inline-flex whitespace-nowrap rounded-full bg-[var(--accent-light)] px-2.5 py-1 text-xs font-semibold text-[var(--brand-purple)]">
                      {coupon.discount || "—"}
                    </span>
                  </td>

                  {/* Country */}
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-gray-700">
                      {coupon.country || "—"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                        coupon.status === "published"
                          ? "bg-green-50 text-green-700"
                          : coupon.status === "expired"
                            ? "bg-red-50 text-red-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {coupon.status.charAt(0).toUpperCase() +
                        coupon.status.slice(1)}
                    </span>
                  </td>

                  {/* Active */}
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => onToggleActive(coupon)}
                      disabled={isActionLoading}
                      title={
                        coupon.isActive
                          ? "Click to deactivate"
                          : "Click to activate"
                      }
                      className="disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                          coupon.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </button>
                  </td>

                  {/* Featured */}
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => onToggleFeatured(coupon)}
                      disabled={isActionLoading}
                      title={
                        coupon.isFeatured
                          ? "Remove from featured"
                          : "Mark as featured"
                      }
                      className="disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                          coupon.isFeatured
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Star
                          size={13}
                          className={coupon.isFeatured ? "fill-current" : ""}
                        />
                        {coupon.isFeatured ? "Featured" : "Not featured"}
                      </span>
                    </button>
                  </td>

                  {/* Verified */}
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => onToggleVerified(coupon)}
                      disabled={isActionLoading}
                      title={
                        coupon.isVerified
                          ? "Remove verification"
                          : "Mark as verified"
                      }
                      className="disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                          coupon.isVerified
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <ShieldCheck
                          size={13}
                          className={coupon.isVerified ? "fill-current" : ""}
                        />
                        {coupon.isVerified ? "Verified" : "Not verified"}
                      </span>
                    </button>
                  </td>

                  {/* Sort Order */}
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-gray-700">
                      {coupon.sortOrder ?? 0}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="px-4 py-4">
                    <span className="whitespace-nowrap text-sm text-gray-600">
                      {formatDate(coupon.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(coupon)}
                        disabled={isActionLoading}
                        title="Edit coupon"
                        aria-label={`Edit ${coupon.title}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pencil size={16} />
                      </button>

                      {coupon.affiliateUrl && (
                        <a
                          href={coupon.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Open affiliate URL: ${truncateUrl(coupon.affiliateUrl)}`}
                          aria-label={`Open affiliate URL for ${coupon.title}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-purple-50 hover:text-[var(--brand-purple)]"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => onDelete(coupon)}
                        disabled={isActionLoading}
                        title="Delete coupon"
                        aria-label={`Delete ${coupon.title}`}
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