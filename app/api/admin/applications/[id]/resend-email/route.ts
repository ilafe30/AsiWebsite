import { NextRequest, NextResponse } from "next/server";
import { updateApplicationEmailStatus } from "@/lib/database";
import { requireAdmin } from "@/lib/api-auth";
import { spawn } from "child_process";
import path from "path";

/**
 * Trigger Python email sending via CLI
 * Calls: python ai_agent/src/my_email/email_cli.py send-one <candidature_id>
 */
async function triggerPythonEmailSend(candidatureId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), "ai_agent", "src", "my_email", "email_cli.py");
    const pythonProcess = spawn("python", [pythonScript, "send-one", String(candidatureId)], {
      cwd: process.cwd(),
    });

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Python email script failed: ${stderr || stdout}`));
      }
    });

    pythonProcess.on("error", (err) => {
      reject(new Error(`Failed to spawn Python process: ${err.message}`));
    });
  });
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  // Verify admin authentication
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    // Trigger Python email system
    await triggerPythonEmailSend(id);

    // Update database to mark email as sent
    updateApplicationEmailStatus(id, true);

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (e: any) {
    console.error("Resend email error:", e);
    return NextResponse.json({ error: e?.message || "Failed to resend email" }, { status: 500 });
  }
}
