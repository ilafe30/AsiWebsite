"use client";

import { useState } from "react";
import { SidebarInset, SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, Mail, RefreshCcw, Settings } from "lucide-react";
import ApplicationsTable from "./admin/applications-table";

export default function AnalysisDashboard() {
  const [active, setActive] = useState<string>("applications");

  return (
    <SidebarProvider className="min-h-screen">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="p-3 font-semibold">Admin</div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={active === "applications"} onClick={() => setActive("applications")}>
                  <FileText className="h-4 w-4" />
                  <span>Applications</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton isActive={active === "settings"} onClick={() => setActive("settings")}>
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="bg-background">
          <main className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
              </Button>
            </div>

            {active === "applications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ApplicationsTable />
                </CardContent>
              </Card>
            )}

            {active !== "applications" && (
              <Card>
                <CardHeader>
                  <CardTitle>{active.charAt(0).toUpperCase() + active.slice(1)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">This module is ready to receive content.</p>
                </CardContent>
              </Card>
            )}
          </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
