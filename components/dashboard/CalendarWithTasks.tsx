"use client";

import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { toast } from "sonner";
import { Task, TaskStatus } from "@/lib/types";
import { clientApi } from "@/lib/clientApi";

interface Props {
  userId: string;
}

export function CalendarWithTasks({ userId }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [objective, setObjective] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<TaskStatus>("To Do");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedDateModal, setSelectedDateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  // Load tasks
  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        const userTasks = clientApi.listTasks(userId);
        setTasks(userTasks);
      } catch (e: any) {
        console.error("Task load error:", e);
        toast.error("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, [userId]);

  const addTask = async () => {
    if (!objective.trim() || !deadline.trim()) {
      toast.error("Objective and deadline are required");
      return;
    }
    
    try {
      const created = clientApi.addTask(userId, {
        objective: objective.trim(),
        description: description.trim(),
        deadline,
        status
      });
      setTasks([created, ...tasks]);
      setObjective("");
      setDescription("");
      setDeadline("");
      setStatus("To Do");
      toast.success("Task added successfully");
    } catch (e: any) {
      console.error("Failed to add task:", e);
      toast.error("Failed to add task");
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updated = clientApi.updateTask(taskId, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? updated : t));
      toast.success("Task status updated");
    } catch (e: any) {
      console.error("Failed to update task:", e);
      toast.error("Failed to update task status");
    }
  };

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return tasks.filter(t => t.deadline === dateStr);
  }, [selectedDate, tasks]);

  // Days with tasks for calendar highlighting
  const daysWithTasks = useMemo(() => 
    tasks.map(t => new Date(t.deadline)),
    [tasks]
  );

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "To Do": return "bg-gray-200";
      case "Ongoing": return "bg-blue-200";
      case "Done": return "bg-green-200";
      default: return "bg-gray-200";
    }
  };

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
          .rdp-day.withTask::after {
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
          .rdp-day_selected.withTask::after {
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
              const hasTasks = tasks.some(t => t.deadline === dateStr);
              if (hasTasks) {
                setSelectedDateModal(true);
              }
            }
          }}
          modifiers={{
            withTask: daysWithTasks,
            selected: selectedDate
          }}
          modifiersClassNames={{
            withTask: "withTask"
          }}
        />
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <h4 className="text-sm font-medium mb-3">Add New Task</h4>
          <div className="space-y-4">
            <Input 
              placeholder="Objective" 
              value={objective} 
              onChange={(e) => setObjective(e.target.value)} 
            />
            <Textarea 
              placeholder="Description (optional)" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
            />
            <Input 
              type="date" 
              value={deadline} 
              onChange={(e) => setDeadline(e.target.value)} 
            />
            <select
              className="w-full border rounded-md h-10 px-3"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              <option value="To Do">To Do</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Done">Done</option>
            </select>
            <Button onClick={addTask} className="w-full">Add Task</Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h4 className="text-sm font-medium mb-3">Recent Tasks</h4>
          <div className="space-y-2">
            {tasks
              .slice()
              .sort((a, b) => (new Date(b.deadline).getTime() - new Date(a.deadline).getTime()))
              .map((task) => (
                <div key={task.id} className={`p-3 rounded-lg ${getStatusColor(task.status)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{task.objective}</p>
                      <p className="text-xs text-gray-600">Due: {task.deadline}</p>
                    </div>
                    <select
                      className="text-xs border rounded px-1 py-0.5"
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                    >
                      <option value="To Do">To Do</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  {task.description && (
                    <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      <Dialog open={selectedDateModal} onOpenChange={setSelectedDateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Tasks for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
            {selectedDateTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className={`p-4 ${getStatusColor(task.status)}`}>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{task.objective}</h4>
                      <select
                        className="text-xs border rounded px-2 py-1"
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                      >
                        <option value="To Do">To Do</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600">{task.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {selectedDateTasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tasks due on this date
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}