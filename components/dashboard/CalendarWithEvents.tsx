"use client";

import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { toast } from "sonner";

import { clientApi } from "@/lib/clientApi";
import type { EventItem as EItem } from "@/lib/types";

interface Training {
  id: number;
  title: string;
  date: string;
  time: string;
  description?: string | null;
}

export function CalendarWithEvents({ scope }: { scope: { type: "startup" | "project"; id: string } }) {
  const initial = useMemo(() => clientApi.listEvents(scope), [scope]);
  const [events, setEvents] = useState<EItem[]>(initial);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  // Training states
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedDateModal, setSelectedDateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load trainings
  useEffect(() => {
    async function loadTrainings() {
      try {
        setLoading(true);
        const res = await fetch("/api/trainings");
        console.log("Training API Response Status:", res.status);
        const json = await res.json();
        
        if (!res.ok) throw new Error(json.error);
        
        if (Array.isArray(json.items)) {
          console.log("Loaded trainings:", json.items.length);
          setTrainings(json.items);
        } else {
          console.error("Invalid trainings data:", json);
          throw new Error("Invalid response format");
        }
      } catch (e: any) {
        console.error("Training load error:", e);
        toast.error("Failed to load trainings");
      } finally {
        setLoading(false);
      }
    }
    loadTrainings();
  }, []);

  const add = () => {
    if (!title.trim() || !date.trim()) return;
    const created = clientApi.addEvent(scope, { title: title.trim(), date });
    setEvents([created, ...events]);
    setTitle("");
    setDate("");
  };

  // Get trainings for selected date
  const selectedDateTrainings = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return trainings.filter(t => t.date === dateStr);
  }, [selectedDate, trainings]);

  // Days with trainings for calendar highlighting
  const daysWithTrainings = useMemo(() => 
    trainings.map(t => new Date(t.date)),
    [trainings]
  );

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-xl border bg-white shadow-sm p-6">
        <style jsx global>{`
          .rdp {
            --rdp-cell-size: 40px;
            --rdp-accent-color: #4f46e5;
            --rdp-background-color: #f3f4f6;
            margin: 0;
          }
          .rdp-month {
            background-color: white;
            border-radius: 12px;
            width: 100%;
          }
          .rdp-caption {
            padding: 0.5rem 0 1.5rem 0;
          }
          .rdp-caption_label {
            font-size: 1rem;
            font-weight: 600;
            color: #1f2937;
            text-transform: capitalize;
          }
          .rdp-nav_button {
            width: 34px;
            height: 34px;
            color: #6b7280;
            border-radius: 8px;
            background-color: #f9fafb;
            transition: all 0.2s;
          }
          .rdp-nav_button:hover {
            background-color: #f3f4f6;
            color: #4f46e5;
          }
          .rdp-head_cell {
            font-size: 0.875rem;
            font-weight: 500;
            color: #6b7280;
            text-transform: uppercase;
            height: 40px;
          }
          .rdp-cell {
            height: 40px;
          }
          .rdp-day {
            width: 36px;
            height: 36px;
            font-size: 0.875rem;
            color: #374151;
            border-radius: 10px;
            transition: all 0.2s;
            position: relative;
          }
          .rdp-day:hover {
            background-color: #f3f4f6;
          }
          .rdp-day_selected {
            background-color: #4f46e5 !important;
            color: white !important;
            font-weight: 600;
          }
          .rdp-day_selected:hover {
            background-color: #4338ca !important;
          }
          .rdp-day.withTraining::after {
            content: '';
            position: absolute;
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background-color: #4f46e5;
          }
          .rdp-day_selected.withTraining::after {
            background-color: white;
          }
        `}</style>
        <DayPicker 
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            setSelectedDate(date);
            if (date) {
              const dateStr = format(date, 'yyyy-MM-dd');
              const hasTrainings = trainings.some(t => t.date === dateStr);
              if (hasTrainings) {
                setSelectedDateModal(true);
              }
            }
          }}
          modifiers={{
            withTraining: daysWithTrainings,
            selected: selectedDate
          }}
          modifiersClassNames={{
            withTraining: "withTraining"
          }}
        />
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <h4 className="text-sm font-medium mb-3">Add Event / Task</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Button onClick={add}>Add</Button>
          </div>
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
                    <p className="text-xs text-muted-foreground">{e.date}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Training Details Modal */}
      <Dialog open={selectedDateModal} onOpenChange={setSelectedDateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Trainings for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
            {selectedDateTrainings.map((training) => (
              <Card key={training.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{training.title}</h4>
                      <Badge variant="secondary">{training.time}</Badge>
                    </div>
                    {training.description && (
                      <p className="text-sm text-muted-foreground">{training.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {selectedDateTrainings.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No trainings scheduled for this date
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

