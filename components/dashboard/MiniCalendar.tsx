"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import Link from "next/link";

export function MiniCalendar() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
        <CardDescription>Quick view of your schedule</CardDescription>
      </CardHeader>
      <CardContent>
        <DayPicker mode="single" />
        <div className="mt-4">
          <Link href="/dashboardfortheuser/schedule">
            <Button variant="outline" size="sm">Open Full Calendar</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}


