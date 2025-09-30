"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DayPicker } from "react-day-picker";

type ScheduleItem = { id: number; title: string; date: string };

export default function SchedulePage() {
  const [items, setItems] = useState<ScheduleItem[]>([
    { id: 1, title: "Team standup", date: "2025-10-02" },
    { id: 2, title: "Release v0.1", date: "2025-10-10" },
  ]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const addItem = () => {
    if (!title.trim() || !date) return;
    const id = Math.max(0, ...items.map((i) => i.id)) + 1;
    setItems([...items, { id, title: title.trim(), date }]);
    setTitle("");
    setDate("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>View and manage the startup schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <DayPicker mode="single" />
            </div>
            <div className="flex gap-2">
              <Input placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Button onClick={addItem}>Add</Button>
            </div>
            <div className="space-y-2">
              {items.map((i) => (
                <div key={i.id} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{i.title}</span>
                  <span className="text-xs text-muted-foreground">{i.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


