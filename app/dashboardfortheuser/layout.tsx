import type { ReactNode } from "react";
import DashboardNavGate from "@/components/dashboard/DashboardNavGate";
import UserDashTopbar from "@/components/dashboard/UserDashTopbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <UserDashTopbar />
      {children}
    </div>
  );
}


