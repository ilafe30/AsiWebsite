"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarWithEvents } from "@/components/dashboard/CalendarWithEvents";
import { clientApi } from "@/lib/clientApi";

type Member = { id: number; name: string; role: string };
type EventItem = { id: number; title: string; date: string };

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = useMemo(() => Number(params?.id), [params]);
  const [projectName, setProjectName] = useState("MVP Development");
  const [projectDesc, setProjectDesc] = useState("Build core product MVP");
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: "Alice", role: "PM" },
    { id: 2, name: "Bob", role: "Engineer" },
  ]);
  const [events, setEvents] = useState<EventItem[]>([
    { id: 1, title: "Kickoff", date: "2025-10-01" },
    { id: 2, title: "Sprint Review", date: "2025-10-15" },
  ]);
  const [inviteRef, setInviteRef] = useState("");
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");

  const invite = () => {
    if (!inviteRef.trim()) return;
    // demo-only: push into local state list; in real backend this would send invite
    const id = Math.max(0, ...members.map((m) => m.id)) + 1;
    setMembers([...members, { id, name: inviteRef.trim(), role: "Member" }]);
    setInviteRef("");
  };

  const addEvent = () => {
    if (!newEventTitle.trim() || !newEventDate) return;
    const id = Math.max(0, ...events.map((e) => e.id)) + 1;
    setEvents([...events, { id, title: newEventTitle.trim(), date: newEventDate }]);
    setNewEventTitle("");
    setNewEventDate("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Name</CardTitle>
            <CardDescription>Update the name of your project</CardDescription>
          </CardHeader>
          <CardContent>
            <Input placeholder="Project name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>Describe the scope and goals</CardDescription>
          </CardHeader>
          <CardContent>
            <Input placeholder="Description" value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>Current members and invitations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-3">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between">
                  <span className="text-sm">{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.role}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input placeholder="Invite member by email or username" value={inviteRef} onChange={(e) => setInviteRef(e.target.value)} />
              <Button onClick={invite}>Invite</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendar & Events</CardTitle>
            <CardDescription>View, add and manage project events</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarWithEvents scope={{ type: "project", id: String(projectId) }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


