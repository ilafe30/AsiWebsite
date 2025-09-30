"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [startup, setStartup] = useState({ name: "Test Startup", website: "", description: "" });
  const [user, setUser] = useState({ fullName: "John Doe", email: "john.doe@example.com" });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Startup Settings</CardTitle>
          <CardDescription>Manage information about your startup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="startup-name">Startup Name</Label>
            <Input id="startup-name" value={startup.name} onChange={(e) => setStartup({ ...startup, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="startup-website">Website</Label>
            <Input id="startup-website" value={startup.website} onChange={(e) => setStartup({ ...startup, website: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="startup-desc">Description</Label>
            <Input id="startup-desc" value={startup.description} onChange={(e) => setStartup({ ...startup, description: e.target.value })} />
          </div>
          <Button className="mt-2">Save Startup</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Settings</CardTitle>
          <CardDescription>Manage your personal account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="full-name">Full Name</Label>
            <Input id="full-name" value={user.fullName} onChange={(e) => setUser({ ...user, fullName: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
          </div>
          <Button className="mt-2">Save User</Button>
        </CardContent>
      </Card>
    </div>
  );
}


