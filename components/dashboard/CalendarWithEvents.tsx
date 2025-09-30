"use client";

import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { clientApi } from "@/lib/clientApi";
import type { EventItem as EItem } from "@/lib/types";

export function CalendarWithEvents({ scope }: { scope: { type: "startup" | "project"; id: string } }) {
  const initial = useMemo(() => clientApi.listEvents(scope), [scope]);
  const [events, setEvents] = useState<EItem[]>(initial);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [assignee, setAssignee] = useState("");
  const [notify, setNotify] = useState(true);

  const add = () => {
    if (!title.trim() || !date.trim() || !assignee.trim()) return;
    const created = clientApi.addEvent(scope, { title: title.trim(), date, assignee: assignee.trim(), notify });
    setEvents([created, ...events]);
    setTitle("");
    setDate("");
    setAssignee("");
    setNotify(true);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-lg border bg-card p-4">
        <DayPicker mode="single" />
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <h4 className="text-sm font-medium mb-3">Add Event / Task</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input placeholder="Assignee (email or username)" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
            <Button onClick={add}>Add</Button>
          </div>
          <label className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Notify assignee
          </label>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h4 className="text-sm font-medium mb-3">Previous Events</h4>
          <div className="space-y-2">
            {events
              .slice()
              .sort((a, b) => (a.date < b.date ? 1 : -1))
              .map((e) => (
                <div key={e.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.date} • {e.assignee} {e.notify ? "• notify" : ""}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}


