import { requireUserSession } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { User, Settings, LogOut, Bell, Users, Calendar, Rocket } from "lucide-react";
import { NotificationsSheet } from "@/components/dashboard/NotificationsSheet";
import { CalendarWithEvents } from "@/components/dashboard/CalendarWithEvents";

export default async function UserDashboardPage() {
  let user = null as any;
  try {
    user = await requireUserSession();
  } catch {
    // Bypass for local testing when TEST_BYPASS_AUTH=1
    if (process.env.TEST_BYPASS_AUTH === "1") {
      user = {
        id: 0,
        email: "test@example.com",
        startupName: "Test Startup",
        emailVerified: true,
        role: "user",
      };
    } else {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Authentication required</CardTitle>
              <CardDescription>Please sign in to access your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button className="w-full">Go to Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  const displayName = user.startupName;

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar moved to layout */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Welcome back, {displayName}!</h2>
              <p className="text-muted-foreground mt-1">Here's what's happening with your entrepreneurial journey</p>
            </div>
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              {user.emailVerified ? "Active Member" : "Unverified"}
            </Badge>
          </div>
        </div>

        {/* Calendar with events */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Calendar</h3>
              <Link href="/dashboardfortheuser/schedule">
                <Button variant="outline" size="sm">Open Full Calendar</Button>
              </Link>
            </div>
            <CalendarWithEvents scope={{ type: "startup", id: "startup-1" }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest interactions with ASI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="bg-accent/10 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Mentorship session scheduled</p>
                  <p className="text-xs text-muted-foreground">Tomorrow at 2:00 PM</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-2 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Project task updated</p>
                  <p className="text-xs text-muted-foreground">"Implement auth" moved to In Progress</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-accent/10 p-2 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Schedule event added</p>
                  <p className="text-xs text-muted-foreground">Sprint Review scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboardfortheuser/users">
                <Button className="w-full justify-start bg-accent text-accent-foreground hover:bg-accent/90">
                  <Users className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
              </Link>

              <Link href="/dashboardfortheuser/schedule">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="h-4 w-4 mr-2" />
                  Overall Schedule
                </Button>
              </Link>

              <Link href="/dashboardfortheuser/projects">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Rocket className="h-4 w-4 mr-2" />
                  Add New Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Your startup projects at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[{ id: 1, name: "MVP Development", progress: 70 }, { id: 2, name: "Marketing Website", progress: 40 }].map((p) => (
                <Card key={p.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <span className="text-sm text-muted-foreground">{p.progress}%</span>
                    </div>
                    <CardDescription>Progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-2 bg-muted rounded">
                      <div className="h-2 bg-accent rounded" style={{ width: `${p.progress}%` }} />
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link href={`/dashboardfortheuser/projects/${p.id}`}>
                        <Button size="sm">Open</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Overview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Schedule Overview</CardTitle>
            <CardDescription>Upcoming items from your startup calendar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[{ title: "Team standup", date: "2025-10-02" }, { title: "Release v0.1", date: "2025-10-10" }].map((i, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{i.title}</span>
                <span className="text-xs text-muted-foreground">{i.date}</span>
              </div>
            ))}
            <div className="pt-3">
              <Link href="/dashboardfortheuser/schedule">
                <Button variant="outline" size="sm">Open Full Schedule</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Profile Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Manage your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{displayName}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">Member status {user.emailVerified ? "Verified" : "Unverified"}</p>
              </div>
              <Button variant="outline">Edit Profile</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



