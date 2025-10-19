"use client";

import { Project, ProjectMember, User } from "./types";
import type { Task } from "./taskTypes";

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

  // Tasks
  listTasks(userId: string): Task[] {
    try {
      const raw = localStorage.getItem('tasks_' + userId);
      if (!raw) return [];
      return JSON.parse(raw) as Task[];
    } catch {
      return [];
    }
  },

  addTask(userId: string, data: Omit<Task, "id" | "userId" | "createdAt">): Task {
    const tasks = this.listTasks(userId);
    const created: Task = {
      id: uid("task"),
      userId,
      createdAt: new Date().toISOString(),
      ...data
    };
    tasks.push(created);
    localStorage.setItem('tasks_' + userId, JSON.stringify(tasks));
    return created;
  },

  updateTask(taskId: string, updates: Partial<Omit<Task, "id" | "userId" | "createdAt">>): Task {
    const userId = taskId.split('_')[1]; // Extract userId from taskId
    const tasks = this.listTasks(userId);
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) {
      throw new Error("Task not found");
    }

    const updated = {
      ...tasks[index],
      ...updates
    };
    tasks[index] = updated;
    localStorage.setItem('tasks_' + userId, JSON.stringify(tasks));
    return updated;
  },
};


