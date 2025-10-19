export type TaskStatus = "To Do" | "Ongoing" | "Done";

export type Task = {
  id: string;
  userId: string;
  objective: string;
  description: string;
  deadline: string;
  status: TaskStatus;
  createdAt: string;
};