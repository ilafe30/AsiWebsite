import AnalysisDashboard from "@/components/analysis-dashboard";
import { requireUserSession } from "@/lib/session";
import { RedirectType } from "next/navigation";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  let user;
  try {
    user = await requireUserSession();
  } catch {
    redirect("/login", RedirectType.replace);
  }
  if (user.role !== "admin") {
    redirect("/dashboardfortheuser", RedirectType.replace);
  }
  return <AnalysisDashboard />;
}