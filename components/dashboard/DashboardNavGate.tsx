"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";

export default function DashboardNavGate() {
  const pathname = usePathname();
  if (
    pathname === "/dashboardfortheuser" ||
    pathname.startsWith("/dashboardfortheuser/settings") ||
    pathname.startsWith("/dashboardfortheuser/projects")
  ) {
    return null;
  }
  return <Navbar />;
}


