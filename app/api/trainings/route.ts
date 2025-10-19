import { NextRequest, NextResponse } from "next/server";
import { listTrainings } from "@/lib/trainings";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    // Check if user is logged in
    if (!session.user) {
      console.log("[Training API] No session user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      // List trainings with error handling
      console.log("[Training API] Fetching trainings for user");
      const { items = [], total = 0 } = listTrainings();
      console.log(`[Training API] Found ${items?.length || 0} trainings`);

      // Ensure we have valid data before mapping
      const safeItems = Array.isArray(items) ? items : [];
      
      return NextResponse.json({ 
        items: safeItems.map(item => ({
          id: item.id || 0,
          title: item.title || '',
          date: item.date || '',
          time: item.time || '',
          description: item.description || null
        })),
        total: total || 0
      });
    } catch (dbError: any) {
      console.error("[Training API] Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to fetch trainings from database" }, 
        { status: 500 }
      );
    }
  } catch (e: any) {
    console.error("[Training API] Session error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to validate session" }, 
      { status: 500 }
    );
  }
}