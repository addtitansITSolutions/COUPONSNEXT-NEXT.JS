
// "use client";

// import { useState } from "react";
// import {
//   RefreshCw,
//   Users,
// } from "lucide-react";

// import UserStats from "./UserStats";
// import RecentActivitySidebar from "./RecentActivitySidebar";

// import {
//   useUser,
//   type User,
// } from "@/lib/hooks/useUsers";

// import UserTable from "@/components/admin/users/UserTable";
// import UserPagination from "@/components/admin/users/UserPagination";
// import UserDeleteModal from "@/components/admin/users/UserDeleteModal";
// import UserDetails from "@/components/admin/users/UserDetails";

// import UserEmptyState from "./UserEmptyState";
// import UserErrorState from "./UserErrorState";
// import UserFilters, {
//   type UserStatusFilter,
// } from "./UserFilters";

// interface UsersDashboardProps {
//   currentAdminId: string;
// }

// export default function UsersDashboard({
//   currentAdminId,
// }: UsersDashboardProps) {
//   const {
//     users,
//     pagination,
//     filters,
//     loading,
//     error,
//     setSearch,
//     setRole,
//     setIsActive,
//     setPage,
//     setLimit,
//     refresh,
//     clearFilters,
//     updateUser: updateUserRequest,
//     deleteUser: deleteUserRequest,
//   } = useUser({ initialLimit: 10 });

//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [editingUser, setEditingUser] = useState<User | null>(null);
//   const [deletingUser, setDeletingUser] = useState<User | null>(null);

//   const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
//   const [actionError, setActionError] = useState("");
//   const [editName, setEditName] = useState("");
//   const [formSubmitting, setFormSubmitting] = useState(false);

//   const hasFilters =
//     filters.search !== "" ||
//     filters.role !== "" ||
//     filters.isActive !== "";

//   const status: UserStatusFilter =
//     filters.isActive === true
//       ? "active"
//       : filters.isActive === false
//         ? "inactive"
//         : "all";

//   async function handleUpdateUser(
//     user: User,
//     data: {
//       name?: string;
//       role?: "admin" | "user";
//       isActive?: boolean;
//     }
//   ): Promise<boolean> {
//     setActionLoadingId(user.id);
//     setActionError("");

//     try {
//       await updateUserRequest(user.id, data);
//       return true;
//     } catch (err) {
//       setActionError(
//         err instanceof Error
//           ? err.message
//           : "Unable to update user."
//       );

//       return false;
//     } finally {
//       setActionLoadingId(null);
//     }
//   }

//   async function handleDeleteUser() {
//     if (!deletingUser) return;

//     setActionLoadingId(deletingUser.id);
//     setActionError("");

//     try {
//       await deleteUserRequest(deletingUser.id);
//       setDeletingUser(null);
//     } catch (err) {
//       setActionError(
//         err instanceof Error
//           ? err.message
//           : "Unable to delete user."
//       );
//     } finally {
//       setActionLoadingId(null);
//     }
//   }

//   async function handleEditSubmit(
//     event: React.FormEvent<HTMLFormElement>
//   ) {
//     event.preventDefault();

//     if (!editingUser) return;

//     const name = editName.trim();

//     if (name.length < 2 || name.length > 100) {
//       setActionError(
//         "Name must contain between 2 and 100 characters."
//       );
//       return;
//     }

//     setFormSubmitting(true);
//     setActionError("");

//     const success = await handleUpdateUser(editingUser, {
//       name,
//     });

//     setFormSubmitting(false);

//     if (success) {
//       setEditingUser(null);
//     }
//   }

//   function handleEdit(user: User) {
//     setEditingUser(user);
//     setEditName(user.name);
//     setActionError("");
//   }

//   function handleToggleActive(user: User) {
//     handleUpdateUser(user, {
//       isActive: !user.isActive,
//     });
//   }

//   function handleToggleRole(user: User) {
//     handleUpdateUser(user, {
//       role: user.role === "admin" ? "user" : "admin",
//     });
//   }

  
//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div className="flex items-center gap-3">
//           <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-purple)]/10 text-[var(--brand-purple)]">
//             <Users size={21} />
//           </div>

//           <div>
//             <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
//               User Management
//             </h1>

//             <p className="mt-1 text-sm text-[var(--muted)]">
//               Manage registered users and their account permissions.
//             </p>
//           </div>
//         </div>

//         <button
//           type="button"
//           onClick={refresh}
//           disabled={loading}
//           className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium text-gray-700 transition hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)] disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           <RefreshCw
//             size={15}
//             className={loading ? "animate-spin" : ""}
//           />
//           Refresh
//         </button>
//       </div>

//       {/* Dashboard Layout */}
//       <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_370px]">

//         {/* Main Content */}
//         <div className="min-w-0 space-y-6">

//           {/* Backend Statistics */}
//           <UserStats />

//           {/* Filters */}
//           <UserFilters
//             search={filters.search}
//             role={filters.role}
//             status={status}
//             onSearchChange={setSearch}
//             onRoleChange={setRole}
//             onStatusChange={(value) =>
//               setIsActive(
//                 value === "all" ? "" : value === "active"
//               )
//             }
//             onClear={clearFilters}
//             hasFilters={hasFilters}
//             disabled={loading}
//           />

//           {/* Action Error */}
//           {actionError && (
//             <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//               {actionError}
//             </div>
//           )}

//           {/* User List */}
//           {error ? (
//             <UserErrorState
//               message={error}
//               onRetry={refresh}
//               retrying={loading}
//             />
//           ) : users.length === 0 && !loading ? (
//             <UserEmptyState
//               hasFilters={hasFilters}
//               onClearFilters={clearFilters}
//               onRefresh={refresh}
//             />
//           ) : (
//             <div className="space-y-4">
//               <UserTable
//                 users={users}
//                 currentAdminId={currentAdminId}
//                 onEdit={handleEdit}
//                 onDelete={setDeletingUser}
//                 onToggleActive={handleToggleActive}
//                 onToggleRole={handleToggleRole}
//                 onViewActivity={setSelectedUser}
//                 actionLoadingId={actionLoadingId}
//               />

//               <UserPagination
//                 page={pagination.page}
//                 totalPages={pagination.totalPages}
//                 total={pagination.total}
//                 limit={pagination.limit}
//                 hasNextPage={pagination.hasNextPage}
//                 hasPreviousPage={pagination.hasPreviousPage}
//                 onPageChange={setPage}
//                 onLimitChange={setLimit}
//                 disabled={loading}
//               />
//             </div>
//           )}
//         </div>

//         {/* Right Sidebar */}
//         <div className="min-w-0 lg:sticky top-4 lg:top-6">
//           <RecentActivitySidebar />
//         </div>
//       </div>

//       {/* Edit User Modal */}
//       {editingUser && (
//         <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
//           <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
//             <h2 className="text-lg font-semibold text-gray-900">
//               Edit User
//             </h2>

//             <p className="mt-1 text-sm text-gray-500">
//               Update the user's display name.
//             </p>

//             <form
//               onSubmit={handleEditSubmit}
//               className="mt-5 space-y-4"
//             >
//               <div>
//                 <label
//                   htmlFor="user-edit-name"
//                   className="mb-2 block text-sm font-medium text-gray-700"
//                 >
//                   Full Name
//                 </label>

//                 <input
//                   id="user-edit-name"
//                   type="text"
//                   value={editName}
//                   onChange={(event) => setEditName(event.target.value)}
//                   minLength={2}
//                   maxLength={100}
//                   required
//                   className="h-11 w-full rounded-lg border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10"
//                 />
//               </div>

//               <div className="flex justify-end gap-3 pt-2">
//                 <button
//                   type="button"
//                   onClick={() => setEditingUser(null)}
//                   disabled={formSubmitting}
//                   className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={formSubmitting}
//                   className="rounded-lg bg-[var(--brand-purple)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
//                 >
//                   {formSubmitting ? "Saving..." : "Save Changes"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation */}
//       <UserDeleteModal
//         user={deletingUser}
//         open={!!deletingUser}
//         loading={actionLoadingId === deletingUser?.id}
//         onConfirm={handleDeleteUser}
//         onCancel={() => setDeletingUser(null)}
//       />

//       {/* User Activity Details */}
//       <UserDetails
//         user={selectedUser}
//         open={!!selectedUser}
//         onClose={() => setSelectedUser(null)}
//       />
//     </div>
//   );

// }




"use client";

import { useState } from "react";
import {
  RefreshCw,
  Users,
  Activity,
  History,
  X,
} from "lucide-react";

import UserStats from "./UserStats";
import RecentActivitySidebar from "./RecentActivitySidebar";

import {
  useUser,
  type User,
} from "@/lib/hooks/useUsers";

import UserTable from "@/components/admin/users/UserTable";
import UserPagination from "@/components/admin/users/UserPagination";
import UserDeleteModal from "@/components/admin/users/UserDeleteModal";
import UserDetails from "@/components/admin/users/UserDetails";

import UserEmptyState from "./UserEmptyState";
import UserErrorState from "./UserErrorState";
import UserFilters, {
  type UserStatusFilter,
} from "./UserFilters";

interface UsersDashboardProps {
  currentAdminId: string;
}

export default function UsersDashboard({
  currentAdminId,
}: UsersDashboardProps) {
  const {
    users,
    pagination,
    filters,
    loading,
    error,
    setSearch,
    setRole,
    setIsActive,
    setPage,
    setLimit,
    refresh,
    clearFilters,
    updateUser: updateUserRequest,
    deleteUser: deleteUserRequest,
  } = useUser({ initialLimit: 10 });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [editName, setEditName] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);

  const hasFilters =
    filters.search !== "" ||
    filters.role !== "" ||
    filters.isActive !== "";

  const status: UserStatusFilter =
    filters.isActive === true
      ? "active"
      : filters.isActive === false
        ? "inactive"
        : "all";

  async function handleUpdateUser(
    user: User,
    data: {
      name?: string;
      role?: "admin" | "user";
      isActive?: boolean;
    }
  ): Promise<boolean> {
    setActionLoadingId(user.id);
    setActionError("");

    try {
      await updateUserRequest(user.id, data);
      return true;
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to update user."
      );

      return false;
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDeleteUser() {
    if (!deletingUser) return;

    setActionLoadingId(deletingUser.id);
    setActionError("");

    try {
      await deleteUserRequest(deletingUser.id);
      setDeletingUser(null);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to delete user."
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleEditSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editingUser) return;

    const name = editName.trim();

    if (name.length < 2 || name.length > 100) {
      setActionError(
        "Name must contain between 2 and 100 characters."
      );
      return;
    }

    setFormSubmitting(true);
    setActionError("");

    const success = await handleUpdateUser(editingUser, {
      name,
    });

    setFormSubmitting(false);

    if (success) {
      setEditingUser(null);
    }
  }

  function handleEdit(user: User) {
    setEditingUser(user);
    setEditName(user.name);
    setActionError("");
  }

  function handleToggleActive(user: User) {
    handleUpdateUser(user, {
      isActive: !user.isActive,
    });
  }

  function handleToggleRole(user: User) {
    handleUpdateUser(user, {
      role: user.role === "admin" ? "user" : "admin",
    });
  }

  return (
    <div className="space-y-6">
      <style jsx>{`
        @keyframes activity-drawer-enter {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes activity-overlay-enter {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .activity-drawer-enter {
          animation: activity-drawer-enter 250ms ease-out both;
        }

        .activity-overlay-enter {
          animation: activity-overlay-enter 200ms ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .activity-drawer-enter,
          .activity-overlay-enter {
            animation: none;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-purple)]/10 text-[var(--brand-purple)]">
            <Users size={21} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              User Management
            </h1>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Manage registered users and their account permissions.
            </p>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
          {/* Mobile and Tablet Activity Button */}
          <button
            type="button"
            onClick={() => setActivityDrawerOpen(true)}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 text-sm font-medium text-gray-700 transition hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)] sm:w-auto lg:hidden"
          >
            <Activity size={16} />
            Recent Activity
          </button>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium text-gray-700 transition hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          {/* <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium text-gray-700 transition hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button> */}
        </div>
      </div>

      {/* Dashboard Layout */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_370px]">
        {/* Main Content */}
        <div className="min-w-0 space-y-6">
          <UserStats />

          <UserFilters
            search={filters.search}
            role={filters.role}
            status={status}
            onSearchChange={setSearch}
            onRoleChange={setRole}
            onStatusChange={(value) =>
              setIsActive(
                value === "all" ? "" : value === "active"
              )
            }
            onClear={clearFilters}
            hasFilters={hasFilters}
            disabled={loading}
          />

          {/* Action Error */}
          {actionError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {actionError}
            </div>
          )}

          {/* User List */}
          {error ? (
            <UserErrorState
              message={error}
              onRetry={refresh}
              retrying={loading}
            />
          ) : users.length === 0 && !loading ? (
            <UserEmptyState
              hasFilters={hasFilters}
              onClearFilters={clearFilters}
              onRefresh={refresh}
            />
          ) : (
            <div className="space-y-4">
              <UserTable
                users={users}
                currentAdminId={currentAdminId}
                onEdit={handleEdit}
                onDelete={setDeletingUser}
                onToggleActive={handleToggleActive}
                onToggleRole={handleToggleRole}
                onViewActivity={setSelectedUser}
                actionLoadingId={actionLoadingId}
              />

              <UserPagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={pagination.limit}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
                onPageChange={setPage}
                onLimitChange={setLimit}
                disabled={loading}
              />
            </div>
          )}
        </div>

        {/* Desktop Activity Sidebar */}
        <div className="sticky top-6 hidden min-w-0 lg:block">
          <RecentActivitySidebar />
        </div>
      </div>

      {/* Mobile and Tablet Activity Drawer */}
      {activityDrawerOpen && (
        <div
          className="fixed inset-0 z-[1100] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Recent activity"
        >
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close activity drawer"
            onClick={() => setActivityDrawerOpen(false)}
            className="activity-overlay-enter absolute inset-0 h-full w-full cursor-default bg-black/50"
          />

          {/* Drawer */}
          <div className="activity-drawer-enter absolute inset-y-0 right-0 flex w-full max-w-[320px] flex-col overflow-y-auto bg-white shadow-2xl">
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] bg-white px-5">
              <div className="flex items-center gap-2">
                <History
                  size={18}
                  className="text-[var(--brand-purple)]"
                />

                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  Latest Updates
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setActivityDrawerOpen(false)}
                aria-label="Close recent activity"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Activity Component */}
            <div className="min-h-0 flex-1">
              <RecentActivitySidebar />
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Edit User
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update the user's display name.
            </p>

            <form
              onSubmit={handleEditSubmit}
              className="mt-5 space-y-4"
            >
              <div>
                <label
                  htmlFor="user-edit-name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>

                <input
                  id="user-edit-name"
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  minLength={2}
                  maxLength={100}
                  required
                  className="h-11 w-full rounded-lg border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  disabled={formSubmitting}
                  className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="rounded-lg bg-[var(--brand-purple)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
                >
                  {formSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <UserDeleteModal
        user={deletingUser}
        open={!!deletingUser}
        loading={actionLoadingId === deletingUser?.id}
        onConfirm={handleDeleteUser}
        onCancel={() => setDeletingUser(null)}
      />

      {/* User Activity Details */}
      <UserDetails
        user={selectedUser}
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
