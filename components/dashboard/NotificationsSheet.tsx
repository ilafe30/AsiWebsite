"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Bell } from "lucide-react";

export function NotificationsSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {[{ t: "Mentorship session scheduled", time: "2h ago" }, { t: "Project task updated", time: "Yesterday" }, { t: "Welcome to ASI!", time: "2 days ago" }].map((n, i) => (
            <div key={i} className="flex items-center justify-between">
              <p className="text-sm text-foreground">{n.t}</p>
              <span className="text-xs text-muted-foreground">{n.time}</span>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}


