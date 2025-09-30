"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { clientApi } from "@/lib/clientApi";
import type { User } from "@/lib/types";

export default function UsersPage() {
  const initial = useMemo(() => clientApi.listUsers(), []);
  const [members, setMembers] = useState<User[]>(initial);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const add = () => {
    if (!fullName.trim() || !email.trim()) return;
    const created = clientApi.addUser({ email: email.trim(), fullName: fullName.trim(), role: "user" });
    setMembers([...members, created]);
    setFullName("");
    setEmail("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Startup Members</CardTitle>
          <CardDescription>Add and manage users in your startup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <Button onClick={add}>Add User</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>List of current users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between">
              <span className="text-sm">{m.fullName}</span>
              <span className="text-xs text-muted-foreground">{m.email}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}


