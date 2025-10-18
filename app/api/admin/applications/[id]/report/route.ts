import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/lib/database";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  // Verify admin authentication
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const db = new DatabaseService();
    const row = db.getReport(id) as any;
    db.close();

    if (!row) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    let structured: any = null;
    try {
      structured = typeof row.structured_result === 'string' ? JSON.parse(row.structured_result) : row.structured_result;
    } catch {
      structured = row.structured_result ?? null;
    }

    return NextResponse.json({
      id: row.id,
      name: row.business_name || `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim() || row.name || 'Unknown',
      submissionDate: row.submission_date,
      analysis: {
        totalScore: row.total_score ?? null,
        isEligible: row.is_eligible ?? null,
        summary: row.ai_response_text ?? '',
        structured,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to fetch report" }, { status: 500 });
  }
}
