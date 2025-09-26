import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// For now, we keep a simple log to track resend actions and reflect status in UI.
// This can be replaced with a real email-queue integration later.

function upsertEmailSentLog(candidatureId: number) {
  const logPath = path.join(process.cwd(), "email_sent_log.json");
  let arr: Array<{ candidature_id: number; sent: boolean; sent_at?: string }> = [];
  if (fs.existsSync(logPath)) {
    try {
      arr = JSON.parse(fs.readFileSync(logPath, "utf-8") || "[]");
    } catch {
      arr = [];
    }
  }
  const idx = arr.findIndex((x) => x.candidature_id === candidatureId);
  const payload = { candidature_id: candidatureId, sent: true, sent_at: new Date().toISOString() };
  if (idx >= 0) arr[idx] = payload; else arr.push(payload);
  fs.writeFileSync(logPath, JSON.stringify(arr, null, 2), "utf-8");
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    // TODO: Hook into your Python EmailService queue here for real sending.
    // For now we mark as sent in the local log so the UI reflects the change.
    upsertEmailSentLog(id);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to resend email" }, { status: 500 });
  }
}
