"use client";

import { EventItem, Project, ProjectMember, User } from "./types";

const STORAGE_KEY = "asi_demo_data_v1";

type Store = {
  users: User[];
  projects: Project[];
  projectMembers: ProjectMember[];
  events: EventItem[];
};

function load(): Store {
  if (typeof window === "undefined") return { users: [], projects: [], projectMembers: [], events: [] };
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { users: [], projects: [], projectMembers: [], events: [] };
  try {
    return JSON.parse(raw) as Store;
  } catch {
    return { users: [], projects: [], projectMembers: [], events: [] };
  }
}

function save(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export const clientApi = {
  // Users
  listUsers(): User[] {
    return load().users;
  },
  addUser(u: Omit<User, "id">): User {
    const s = load();
    const created: User = { id: uid("usr"), ...u };
    s.users.push(created);
    save(s);
    return created;
  },

  // Projects
  listProjects(): Project[] {
    return load().projects;
  },
  addProject(p: Omit<Project, "id">): Project {
    const s = load();
    const created: Project = { id: uid("prj"), ...p };
    s.projects.push(created);
    save(s);
    return created;
  },
  getProject(id: string): Project | undefined {
    return load().projects.find((p) => p.id === id);
  },

  // Project Members
  listProjectMembers(projectId: string): ProjectMember[] {
    return load().projectMembers.filter((m) => m.projectId === projectId);
  },
  inviteMember(projectId: string, userRef: string, role?: string): ProjectMember {
    const s = load();
    const created: ProjectMember = { id: uid("mem"), projectId, userRef, role };
    s.projectMembers.push(created);
    save(s);
    return created;
  },

  // Events (startup or project scoped)
  listEvents(scope: { type: "startup" | "project"; id: string }): EventItem[] {
    return load().events
      .filter((e) => e.scope.type === scope.type && e.scope.id === scope.id)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  },
  addEvent(scope: { type: "startup" | "project"; id: string }, data: Omit<EventItem, "id" | "scope">): EventItem {
    const s = load();
    const created: EventItem = { id: uid("evt"), scope, ...data };
    s.events.push(created);
    save(s);
    return created;
  },
};


