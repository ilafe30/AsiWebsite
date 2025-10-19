"use client";

import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { toast } from "sonner";
import { X, Check, CalendarDays, CircleDot } from "lucide-react";
import { isAfter, parseISO, startOfDay } from "date-fns";

interface Training {
  id: number;
  title: string;
  date: string;
  time: string;
  description?: string | null;
}

interface Task {
  id: string;
  userId: string;
  objective: string;
  description: string;
  deadline: string;
  status: "To Do" | "Ongoing" | "Done";
}

interface Props {
  userId: string;
}

export function CalendarWithBoth({ userId }: Props) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedDateModal, setSelectedDateModal] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Helper function to group tasks by status
  const groupTasksByStatus = (tasks: Task[]) => {
    return tasks.reduce((acc, task) => {
      const status = task.status;
      if (!acc[status]) acc[status] = [];
      acc[status].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  };

  // Task form states
  const [objective, setObjective] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<"To Do" | "Ongoing" | "Done">("To Do");

  // Load trainings
  useEffect(() => {
    async function loadTrainings() {
      try {
        setLoading(true);
        const res = await fetch("/api/trainings");
        const json = await res.json();
        
        if (!res.ok) throw new Error(json.error);
        
        if (Array.isArray(json.items)) {
          setTrainings(json.items);
        } else {
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

  // Load tasks
  useEffect(() => {
    const loadTasks = () => {
      try {
        const tasksStr = localStorage.getItem('tasks_' + userId);
        if (tasksStr) {
          const tasks = JSON.parse(tasksStr);
          setTasks(Array.isArray(tasks) ? tasks : []);
        }
      } catch (e) {
        console.error("Failed to load tasks:", e);
        toast.error("Failed to load your tasks");
      }
    };
    loadTasks();
  }, [userId]);

  const addTask = () => {
    if (!objective.trim() || !deadline.trim()) {
      toast.error("Objective and deadline are required");
      return;
    }
    
    try {
      const newTask: Task = {
        id: 'task_' + Math.random().toString(36).slice(2),
        userId,
        objective: objective.trim(),
        description: description.trim(),
        deadline,
        status
      };

      const updatedTasks = [newTask, ...tasks];
      localStorage.setItem('tasks_' + userId, JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
      
      setObjective("");
      setDescription("");
      setDeadline("");
      setStatus("To Do");
      toast.success("Task added successfully");
    } catch (e) {
      console.error("Failed to add task:", e);
      toast.error("Failed to add task");
    }
  };

  const deleteTask = (taskId: string) => {
    try {
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      localStorage.setItem('tasks_' + userId, JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
      toast.success("Task deleted");
    } catch (e) {
      console.error("Failed to delete task:", e);
      toast.error("Failed to delete task");
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: "To Do" | "Ongoing" | "Done") => {
    try {
      const updatedTasks = tasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      localStorage.setItem('tasks_' + userId, JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
      toast.success("Task status updated");
    } catch (e) {
      console.error("Failed to update task:", e);
      toast.error("Failed to update task status");
    }
  };

  // Get tasks and trainings for selected date
  const selectedDateItems = useMemo(() => {
    if (!selectedDate) return { tasks: [], trainings: [] };
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return {
      tasks: tasks.filter(t => t.deadline === dateStr),
      trainings: trainings.filter(t => t.date === dateStr)
    };
  }, [selectedDate, tasks, trainings]);

  // Days with tasks or trainings for calendar highlighting
  const daysWithItems = useMemo(() => {
    const dates = new Set();
    tasks.forEach(t => dates.add(t.deadline));
    trainings.forEach(t => dates.add(t.date));
    return Array.from(dates).map(d => new Date(d as string));
  }, [tasks, trainings]);

  const isOverdue = (deadline: string, status: "To Do" | "Ongoing" | "Done") => {
    return status !== "Done" && isAfter(startOfDay(new Date()), parseISO(deadline));
  };

  const getStatusColor = (status: "To Do" | "Ongoing" | "Done", deadline: string) => {
    if (isOverdue(deadline, status)) return "bg-red-50 border-red-200 border shadow-sm";
    switch (status) {
      case "To Do": return "bg-gray-50 border-gray-200 border shadow-sm";
      case "Ongoing": return "bg-blue-50 border-blue-200 border shadow-sm";
      case "Done": return "bg-green-50 border-green-200 border shadow-sm";
    }
  };

  const getStatusBadgeColor = (status: "To Do" | "Ongoing" | "Done") => {
    switch (status) {
      case "To Do": return "bg-gray-100 text-gray-700";
      case "Ongoing": return "bg-blue-100 text-blue-700";
      case "Done": return "bg-green-100 text-green-700";
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
          .rdp-day.withItems::after {
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
          .rdp-day_selected.withItems::after {
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
              const hasItems = trainings.some(t => t.date === dateStr) || 
                             tasks.some(t => t.deadline === dateStr);
              if (hasItems) {
                setSelectedDateModal(true);
              }
            }
          }}
          modifiers={{
            withItems: daysWithItems,
            selected: selectedDate
          }}
          modifiersClassNames={{
            withItems: "withItems"
          }}
        />
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-base font-semibold text-gray-900">Add New Task</h4>
              <p className="text-sm text-gray-500 mt-0.5">Create a task to track your progress</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setTaskModalOpen(true)}
              className="shrink-0"
            >
              View All Tasks
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <Input 
                placeholder="What needs to be done?" 
                value={objective} 
                onChange={(e) => setObjective(e.target.value)}
                className="h-11 text-base"
              />
            </div>
            <div>
              <Textarea 
                placeholder="Add any additional details (optional)" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1.5">Due Date</p>
                <Input 
                  type="date" 
                  value={deadline} 
                  onChange={(e) => setDeadline(e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1.5">Status</p>
                <select
                  className="w-full border rounded-md h-9 px-3 text-sm bg-white"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "To Do" | "Ongoing" | "Done")}
                >
                  <option value="To Do">To Do</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>
            <Button 
              onClick={addTask} 
              className="w-full h-11 text-base font-medium mt-2"
              variant="default"
            >
              Create Task
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Tasks Modal */}
      <Dialog open={taskModalOpen} onOpenChange={setTaskModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Your Tasks</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(groupTasksByStatus(tasks)).map(([status, statusTasks]) => (
                <div key={status} className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <CircleDot className="h-4 w-4" />
                    {status} ({statusTasks.length})
                  </h3>
                  {statusTasks
                    .sort((a, b) => (new Date(b.deadline).getTime() - new Date(a.deadline).getTime()))
                    .map((task) => (
                      <div key={task.id} className={`p-3 rounded-lg ${getStatusColor(task.status, task.deadline)}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium ${isOverdue(task.deadline, task.status) ? 'text-red-600' : ''}`}>
                              {task.objective}
                            </p>
                            <p className={`text-xs ${isOverdue(task.deadline, task.status) ? 'text-red-500' : 'text-gray-600'}`}>
                              Due: {task.deadline}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              className="text-xs border rounded px-2 py-1"
                              value={task.status}
                              onChange={(e) => updateTaskStatus(task.id, e.target.value as "To Do" | "Ongoing" | "Done")}
                            >
                              <option value="To Do">To Do</option>
                              <option value="Ongoing">Ongoing</option>
                              <option value="Done">Done</option>
                            </select>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                        {task.description && (
                          <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                        )}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Date Details Modal */}
      <Dialog open={selectedDateModal} onOpenChange={setSelectedDateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <span>{selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 max-h-[60vh] overflow-y-auto py-4">
            {selectedDateItems.trainings.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <CalendarDays className="h-4 w-4" />
                  Trainings
                </h3>
                <div className="space-y-3">
                  {selectedDateItems.trainings.map((training) => (
                    <Card key={training.id}>
                      <CardContent className="p-4 bg-purple-50">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{training.title}</h4>
                            <Badge variant="secondary">{training.time}</Badge>
                          </div>
                          {training.description && (
                            <p className="text-sm text-gray-600">{training.description}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {selectedDateItems.tasks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <CircleDot className="h-4 w-4" />
                  Your Tasks
                </h3>
                <div className="space-y-3">
                  {selectedDateItems.tasks.map((task) => (
                    <Card key={task.id}>
                      <CardContent className={`p-4 ${getStatusColor(task.status, task.deadline)} transition-all duration-200 hover:shadow-md`}>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-medium text-sm truncate ${isOverdue(task.deadline, task.status) ? 'text-red-600' : 'text-gray-900'}`}>
                                {task.objective}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <p className={`text-xs ${isOverdue(task.deadline, task.status) ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                                  {isOverdue(task.deadline, task.status) ? '⚠ Due: ' : 'Due: '}{task.deadline}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <select
                                className="text-xs border rounded-md px-2 py-1.5 bg-white shadow-sm hover:bg-gray-50 transition-colors"
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task.id, e.target.value as "To Do" | "Ongoing" | "Done")}
                                style={{
                                  borderColor: task.status === 'Done' ? '#10B981' : 
                                             task.status === 'Ongoing' ? '#3B82F6' : '#D1D5DB'
                                }}
                              >
                                <option value="To Do">To Do</option>
                                <option value="Ongoing">Ongoing</option>
                                <option value="Done">Done</option>
                              </select>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1.5 hover:bg-red-50 rounded-full transition-colors group"
                                title="Delete task"
                              >
                                <X className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
                              </button>
                            </div>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {selectedDateItems.trainings.length === 0 && selectedDateItems.tasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No trainings or tasks scheduled for this date
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}