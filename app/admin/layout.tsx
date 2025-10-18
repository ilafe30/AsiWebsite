import { requireUserSession } from "@/lib/session";
import { RedirectType, redirect } from "next/navigation";
import AdminLayoutClient from "@/components/admin/admin-layout-client";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await requireUserSession();
  } catch {
    // Bypass for local testing when TEST_BYPASS_AUTH=1
    if (process.env.TEST_BYPASS_AUTH === "1") {
      user = {
        id: 0,
        email: "admin@test.com",
        startupName: "Admin",
        emailVerified: true,
        role: "admin" as const,
      };
    } else {
      redirect("/login", RedirectType.replace);
    }
  }
  
  if (user.role !== "admin") {
    redirect("/dashboardfortheuser", RedirectType.replace);
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
