import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUserSession } from "@/lib/session";
import { AuthDatabaseService } from "@/lib/database";

// Schema for task validation
const taskSchema = z.object({
  objective: z.string().min(1, "Objective is required"),
  description: z.string().optional(),
  period: z.enum(["monthly", "quarterly"]),
  deadline: z.string(), // Date in ISO format
  status: z.enum(["To Do", "Ongoing", "Done"]),
  progress: z.number().min(0).max(100).optional(),
});

// GET /api/tasks
export async function GET(req: NextRequest) {
  const db = new AuthDatabaseService();
  try {
    const user = await requireUserSession();
    const tasks = db.getUserTasks(user.id);

    return NextResponse.json({ items: tasks });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch tasks" },
      { status: 500 }
    );
  } finally {
    db.close();
  }
}

// POST /api/tasks
export async function POST(req: NextRequest) {
  const db = new AuthDatabaseService();
  try {
    const user = await requireUserSession();
    const body = await req.json();
    
    const validatedData = taskSchema.parse(body);
    const newTask = db.createUserTask(user.id, validatedData);
    
    return NextResponse.json(newTask);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create task" },
      { status: 400 }
    );
  } finally {
    db.close();
  }
}

// PUT /api/tasks/:id
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const db = new AuthDatabaseService();
  try {
    const user = await requireUserSession();
    const body = await req.json();
    
    const validatedData = taskSchema.partial().parse(body);
    const updated = db.updateUserTask(parseInt(params.id), user.id, validatedData);
    
    if (!updated) {
      return NextResponse.json(
        { error: "Task not found or access denied" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update task" },
      { status: 400 }
    );
  } finally {
    db.close();
  }
}