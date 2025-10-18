import { NextRequest, NextResponse } from "next/server";
import { AuthDatabaseService } from "@/lib/database";
import { requireAdmin } from "@/lib/api-auth";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // Verify admin authentication
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
    const { startup_name, email, role, password } = body || {};

    const authDb = new AuthDatabaseService();

    // Update basic info
    if (startup_name || email || role) {
      authDb.updateUser(id, { startup_name, email, role });
    }

    // Update password if provided
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      authDb.updatePassword(id, passwordHash);
    }

    authDb.close();

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  // Verify admin authentication
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const authDb = new AuthDatabaseService();
    authDb.deleteUser(id);
    authDb.close();

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to delete user" }, { status: 500 });
  }
}
