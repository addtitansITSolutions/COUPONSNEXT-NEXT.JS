// "use client";

// import { ReactNode, useState } from "react";
// import AdminSidebar from "@/components/admin/AdminSidebar";
// import AdminHeader from "@/components/admin/AdminHeader";

// export default function AdminLayout({
//   children,
// }: {
//   children: ReactNode;
// }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   return (
//     <div className="h-screen overflow-hidden bg-[var(--background)]">
//       <div className="flex h-full min-h-0">
//         {/* Sidebar */}
//         <AdminSidebar
//           isOpen={sidebarOpen}
//           onClose={() => setSidebarOpen(false)}
//         />

//         {/* Main Area */}
//         <div className="flex min-h-0 min-w-0 flex-1 flex-col">
//           {/* Header */}
//           <AdminHeader
//             onMenuClick={() => setSidebarOpen(true)}
//           />

//           {/* Scrollable Content */}
//           <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
//             {children}
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }


import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guards";
import AdminShell from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch (error) {
    const statusCode =
      error instanceof Error && "statusCode" in error
        ? (error as { statusCode?: number }).statusCode
        : undefined;

    if (statusCode === 401) {
      redirect("/login");
    }

    if (statusCode === 403) {
      redirect("/");
    }

    throw error;
  }

  return <AdminShell>{children}</AdminShell>;
}