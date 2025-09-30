"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { NotificationsSheet } from "@/components/dashboard/NotificationsSheet";
import { Settings, LogOut, Users } from "lucide-react";

export default function UserDashTopbar() {
  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ASI_Transparent_SD-knzc0SIjlFdpoLdRiMdhKs5hbOwXQL.png"
              alt="ASI Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationsSheet />
            <Link href="/dashboardfortheuser/settings">
              <Button variant="ghost" size="sm" aria-label="Settings">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" size="sm" aria-label="Messages">
                <Users className="h-4 w-4" />
              </Button>
            </Link>
            <form action="/api/auth/logout" method="post">
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}


