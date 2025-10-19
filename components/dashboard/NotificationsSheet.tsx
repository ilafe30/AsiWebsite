"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, isBefore, parseISO, addDays } from "date-fns";

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

interface Notification {
  id: string;
  type: 'deadline' | 'training' | 'new-training' | 'overdue';
  title: string;
  description?: string;
  time: string;
  status: 'unread' | 'read';
  date?: string;
  priority?: 'high';
}

export function NotificationsSheet() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  // Function to check deadlines and create notifications
  const checkDeadlinesAndTrainings = () => {
    try {
      // Get tasks from localStorage
      const tasksStr = localStorage.getItem('tasks_' + userId);
      const tasks: Task[] = tasksStr ? JSON.parse(tasksStr) : [];
      
      // Get trainings from localStorage or fetch them
      const trainingsStr = localStorage.getItem('trainings');
      const trainings: Training[] = trainingsStr ? JSON.parse(trainingsStr) : [];

      const newNotifications: Notification[] = [];

      // Check for overdue and upcoming deadlines
      tasks.forEach(task => {
        if (task.status !== 'Done') {
          const deadlineDate = parseISO(task.deadline);
          const now = new Date();
          const oneDayFromNow = addDays(now, 1);

          // Check for overdue tasks
          if (isBefore(deadlineDate, now)) {
            newNotifications.push({
              id: `overdue-${task.id}`,
              type: 'overdue',
              title: `Overdue: ${task.objective}`,
              description: `Was due ${formatDistanceToNow(deadlineDate, { addSuffix: true })}`,
              time: new Date().toISOString(),
              status: 'unread',
              date: task.deadline,
              priority: 'high'
            });
          }
          // Check for upcoming deadlines in next 24 hours
          else if (isBefore(deadlineDate, oneDayFromNow)) {
            newNotifications.push({
              id: `deadline-${task.id}`,
              type: 'deadline',
              title: task.objective,
              description: `Due ${formatDistanceToNow(deadlineDate, { addSuffix: true })}`,
              time: new Date().toISOString(),
              status: 'unread',
              date: task.deadline
            });
          }
        }
      });

      // Check for upcoming trainings (in the next 24 hours)
      trainings.forEach(training => {
        const trainingDate = parseISO(training.date);
        const now = new Date();
        const oneDayFromNow = addDays(now, 1);

        if (isBefore(trainingDate, oneDayFromNow) && isBefore(now, trainingDate)) {
          newNotifications.push({
            id: `training-${training.id}`,
            type: 'training',
            title: training.title,
            description: `Scheduled ${formatDistanceToNow(trainingDate, { addSuffix: true })}`,
            time: new Date().toISOString(),
            status: 'unread',
            date: training.date
          });
        }
      });

      // Sort notifications by date
      newNotifications.sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return parseISO(a.date).getTime() - parseISO(b.date).getTime();
      });

      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const uniqueNewNotifications = newNotifications.filter(n => !existingIds.has(n.id));
        const combinedNotifications = [...prev, ...uniqueNewNotifications];
        
        // Keep only the last 20 notifications
        const trimmedNotifications = combinedNotifications.slice(-20);
        
        // Update unread count
        setUnreadCount(trimmedNotifications.filter(n => n.status === 'unread').length);
        
        return trimmedNotifications;
      });

    } catch (error) {
      console.error('Error checking deadlines and trainings:', error);
    }
  };

  // Listen for new training sessions
  useEffect(() => {
    const checkForNewTrainings = () => {
      // You would typically implement server-side events or websockets here
      // For now, we'll just check localStorage periodically
      const lastCheckStr = localStorage.getItem('lastTrainingCheck');
      const lastCheck = lastCheckStr ? new Date(lastCheckStr) : new Date(0);
      const trainingsStr = localStorage.getItem('trainings');
      const trainings: Training[] = trainingsStr ? JSON.parse(trainingsStr) : [];

      trainings.forEach(training => {
        const trainingDate = new Date(training.date);
        if (trainingDate > lastCheck) {
          setNotifications(prev => [{
            id: `new-training-${training.id}`,
            type: 'new-training',
            title: 'New Training Session Added',
            description: training.title,
            time: new Date().toISOString(),
            status: 'unread',
            date: training.date
          }, ...prev]);
          setUnreadCount(count => count + 1);
        }
      });

      localStorage.setItem('lastTrainingCheck', new Date().toISOString());
    };

    // Check initially and set up periodic checks
    checkDeadlinesAndTrainings();
    checkForNewTrainings();

    const interval = setInterval(() => {
      checkDeadlinesAndTrainings();
      checkForNewTrainings();
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [userId]);

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, status: 'read' }))
    );
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <Clock className="h-4 w-4 text-red-500" />;
      case 'deadline':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'training':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'new-training':
        return <Calendar className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Notifications" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-96">
        <SheetHeader className="flex items-center justify-between">
          <SheetTitle>Notifications</SheetTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              No notifications to show
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  notification.type === 'overdue'
                    ? 'bg-red-50 hover:bg-red-100'
                    : notification.status === 'unread'
                    ? 'bg-accent/5 hover:bg-accent/10'
                    : 'hover:bg-accent/5'
                }`}
              >
                <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    notification.status === 'unread' ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {notification.title}
                  </p>
                  {notification.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notification.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(parseISO(notification.time), { addSuffix: true })}
                  </p>
                </div>
                {notification.status === 'unread' && (
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}


