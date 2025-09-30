export type User = {
  id: string;
  email: string;
  fullName?: string;
  role?: "user" | "admin";
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  progress?: number;
};

export type ProjectMember = {
  id: string;
  projectId: string;
  userRef: string; // email or username for now
  role?: string;
};

export type EventItem = {
  id: string;
  scope: { type: "startup" | "project"; id: string };
  title: string;
  date: string;
  assignee: string; // email or username
  notify: boolean;
};


