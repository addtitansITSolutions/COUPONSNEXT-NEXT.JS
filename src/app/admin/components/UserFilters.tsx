
// "use client";

// import { Search, RotateCcw } from "lucide-react";

// export type UserRoleFilter = "admin" | "user" | "";
// export type UserStatusFilter = "all" | "active" | "inactive";

// interface UserFiltersProps {
//   search: string;
//   role: UserRoleFilter;
//   status: UserStatusFilter;
//   onSearchChange: (value: string) => void;
//   onRoleChange: (value: UserRoleFilter) => void;
//   onStatusChange: (value: UserStatusFilter) => void;
//   onClear: () => void;
//   hasFilters: boolean;
//   disabled?: boolean;
// }

// export default function UserFilters({
//   search,
//   role,
//   status,
//   onSearchChange,
//   onRoleChange,
//   onStatusChange,
//   onClear,
//   hasFilters,
//   disabled = false,
// }: UserFiltersProps) {
//   return (
//     <div className="rounded-xl border border-[var(--border)] bg-white p-4">
//       <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
//         {/* Search */}
//         <div className="relative min-w-0 flex-1">
//           <Search
//             size={18}
//             className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//           />

//           <input
//             type="text"
//             value={search}
//             onChange={(event) => onSearchChange(event.target.value)}
//             placeholder="Search by name or email..."
//             disabled={disabled}
//             className="h-10 w-full rounded-lg border border-[var(--border)] bg-white pl-10 pr-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:opacity-60"
//           />
//         </div>

//         {/* Role Filter */}
//         <div className="w-full lg:w-40">
//           <select
//             value={role}
//             onChange={(event) =>
//               onRoleChange(event.target.value as UserRoleFilter)
//             }
//             disabled={disabled}
//             className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             <option value="">All roles</option>
//             <option value="admin">Admin</option>
//             <option value="user">User</option>
//           </select>
//         </div>

//         {/* Status Filter */}
//         <div className="w-full lg:w-40">
//           <select
//             value={status}
//             onChange={(event) =>
//               onStatusChange(event.target.value as UserStatusFilter)
//             }
//             disabled={disabled}
//             className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             <option value="all">All statuses</option>
//             <option value="active">Active</option>
//             <option value="inactive">Inactive</option>
//           </select>
//         </div>

//         {/* Clear Filters */}
//         {hasFilters && (
//           <button
//             type="button"
//             onClick={onClear}
//             disabled={disabled}
//             className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 text-sm font-medium text-gray-600 transition hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)] disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             <RotateCcw size={15} />
//             Clear filters
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }



"use client";

import { Search, RotateCcw } from "lucide-react";

export type UserRoleFilter = "admin" | "user" | "";
export type UserStatusFilter = "all" | "active" | "inactive";

interface UserFiltersProps {
  search: string;
  role: UserRoleFilter;
  status: UserStatusFilter;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: UserRoleFilter) => void;
  onStatusChange: (value: UserStatusFilter) => void;
  onClear: () => void;
  hasFilters: boolean;
  disabled?: boolean;
}

export default function UserFilters({
  search,
  role,
  status,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onClear,
  hasFilters,
  disabled = false,
}: UserFiltersProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        {/* Search */}
        <div className="relative min-w-0 flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name or email..."
            disabled={disabled}
            className="h-10 w-full rounded-lg border border-[var(--border)] bg-white pl-10 pr-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-2 gap-3 xl:flex xl:shrink-0">
          {/* Role Filter */}
          <div className="min-w-0 xl:w-40">
            <select
              value={role}
              onChange={(event) =>
                onRoleChange(event.target.value as UserRoleFilter)
              }
              disabled={disabled}
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="min-w-0 xl:w-40">
            <select
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as UserStatusFilter)
              }
              disabled={disabled}
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className="col-span-2 inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 text-sm font-medium text-gray-600 transition hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)] disabled:cursor-not-allowed disabled:opacity-60 xl:col-span-1"
            >
              <RotateCcw size={15} />
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}