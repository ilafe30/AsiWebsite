"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Training {
  id: number;
  title: string;
  date: string;
  time: string;
  description?: string | null;
}

export default function SchedulePage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  
  // Load trainings
  useEffect(() => {
    async function loadTrainings() {
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
  }, []);

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
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3">Loading trainings...</span>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-destructive text-center">
                <p>{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 text-sm text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
          <CardHeader>
            <CardTitle>Training Schedule</CardTitle>
            <CardDescription>View upcoming training sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
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
                <div className="space-y-2">
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
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Upcoming Trainings</h3>
              <div className="space-y-2">
                {trainings
                  .filter(t => new Date(t.date) >= new Date())
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
              </div>
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}
