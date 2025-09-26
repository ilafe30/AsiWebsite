import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/lib/database";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get("pageSize") || "10", 10), 1), 100);
    const status = searchParams.get("status") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;

    const db = new DatabaseService();
    const { items, total } = db.getApplications({
      status,
      dateFrom,
      dateTo,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    db.close();

    const data = items.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      submissionDate: row.submission_date,
      analysisStatus: row.status ?? (row.analysis_result_id ? "analyzed" : "pending"),
      totalScore: row.total_score ?? null,
      isEligible: row.is_eligible ?? null,
      emailSent: !!(row.email_sent || row.email_sent_date),
    }));

    return NextResponse.json({
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      items: data,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to fetch applications" }, { status: 500 });
  }
}
