"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarInset, SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { FileText, RefreshCcw, Settings, GraduationCap, Users, LogOut } from "lucide-react";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        window.location.href = "/login";
      }
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <SidebarProvider className="min-h-screen">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="p-3 font-semibold">Admin</div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/admin">
                <SidebarMenuButton isActive={pathname === "/admin"}>
                  <FileText className="h-4 w-4" />
                  <span>Applications</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <Link href="/admin/users">
                <SidebarMenuButton isActive={pathname === "/admin/users"}>
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <Link href="/admin/trainings">
                <SidebarMenuButton isActive={pathname === "/admin/trainings"}>
                  <GraduationCap className="h-4 w-4" />
                  <span>Trainings</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <Link href="/admin/settings">
                <SidebarMenuButton isActive={pathname === "/admin/settings"}>
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      
      <SidebarInset className="bg-background">
        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
