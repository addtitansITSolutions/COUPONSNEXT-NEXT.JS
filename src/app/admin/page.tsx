
import { requireAdmin } from "@/lib/auth-guards";
import UsersDashboard from "./components/UsersDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const currentAdmin = await requireAdmin();

  return (
    <UsersDashboard
      currentAdminId={currentAdmin._id.toString()}
    />
  );
}
