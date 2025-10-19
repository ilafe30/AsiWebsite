"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";

interface Training {
  id: number;
  title: string;
  date: string;
  time: string;
  description?: string | null;
}

interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleModal({ open, onOpenChange }: ScheduleModalProps) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  useEffect(() => {
    async function loadTrainings() {
      if (!open) return; // Only load when modal is open
      try {
        setLoading(true);
        const res = await fetch("/api/trainings");
        console.log("Training API Response Status:", res.status);
        const json = await res.json();
        console.log("Training API Response:", json);
        
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
        setError(e?.message || "Failed to load trainings");
        toast.error(e?.message || "Failed to load trainings");
      } finally {
        setLoading(false);
      }
    }
    loadTrainings();
  }, [open]);

  // Get trainings for selected date
  const selectedDateTrainings = trainings.filter(
    t => t.date === (selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null)
  );

  // Format date for display
  const formatDate = (date: string) => {
    const d = new Date(date);
    return format(d, 'MMMM d, yyyy');
  };

  // Days with trainings for calendar highlighting
  const daysWithTrainings = trainings.map(t => new Date(t.date));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Training Schedule</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Loading trainings...</span>
          </div>
        ) : error ? (
          <div className="text-destructive text-center p-6">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 p-6">
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{
                  withTraining: daysWithTrainings
                }}
                modifiersClassNames={{
                  withTraining: "bg-primary/10 font-bold"
                }}
              />
            </div>
            <div className="space-y-4">
              <h3 className="font-medium">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {selectedDateTrainings.length > 0 ? (
                  selectedDateTrainings.map((training) => (
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
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {selectedDate ? 'No trainings scheduled for this date' : 'Select a date to view trainings'}
                  </p>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Upcoming Trainings</h3>
                <div className="space-y-2">
                  {trainings
                    .filter(t => new Date(t.date) >= new Date())
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 5)
                    .map((training) => (
                      <div key={training.id} className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{training.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(training.date)} at {training.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  {trainings.length === 0 && (
                    <p className="text-sm text-muted-foreground">No upcoming trainings scheduled</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}