"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const mock = [
  { id: 3, title: "Mentorship session scheduled", time: "2 hours ago" },
  { id: 2, title: "Application submitted", time: "Yesterday" },
  { id: 1, title: "Welcome to ASI!", time: "2 days ago" },
];

export default function NotificationsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Most recent first</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mock.map((n) => (
            <div key={n.id} className="flex items-center justify-between">
              <p className="text-sm text-foreground">{n.title}</p>
              <span className="text-xs text-muted-foreground">{n.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}


