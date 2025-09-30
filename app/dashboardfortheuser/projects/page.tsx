"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import { clientApi } from "@/lib/clientApi";
import type { Project } from "@/lib/types";

export default function ProjectsPage() {
  const initial = useMemo(() => clientApi.listProjects(), []);
  const [projects, setProjects] = useState<Project[]>(initial);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const addProject = () => {
    if (!newName.trim()) return;
    const created = clientApi.addProject({ name: newName.trim(), description: newDesc.trim(), progress: 0 });
    setProjects([...projects, created]);
    setNewName("");
    setNewDesc("");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Track progress and manage members & events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input placeholder="New project name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            <Button onClick={addProject}>Add Project</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <span className="text-sm text-muted-foreground">{p.progress ?? 0}%</span>
              </div>
              <CardDescription>
                {p.description || "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-2 bg-muted rounded">
                <div className="h-2 bg-accent rounded" style={{ width: `${p.progress ?? 0}%` }} />
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
    </div>
  );
}


