import { NextRequest, NextResponse } from "next/server";
import { createTraining, listTrainings } from "@/lib/trainings";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  // Verify admin authentication
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    
    const offset = (page - 1) * pageSize;
    const { items, total } = listTrainings({ limit: pageSize, offset });
    
    return NextResponse.json({ 
      items, 
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to list trainings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Verify admin authentication
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const { title, date, time, description } = body || {};

    if (!title || !date || !time) {
      return NextResponse.json({ error: "Title, date and time are required" }, { status: 400 });
    }

    const id = createTraining({ title, date, time, description });
    return NextResponse.json({ success: true, id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to create training" }, { status: 500 });
  }
}
