import { NextRequest, NextResponse } from "next/server";
import { AuthDatabaseService } from "@/lib/database";
import { requireAdmin } from "@/lib/api-auth";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  // Verify admin authentication
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const role = searchParams.get("role") || undefined;

    const offset = (page - 1) * pageSize;
    const authDb = new AuthDatabaseService();
    
    const { items, total } = authDb.listUsers({ limit: pageSize, offset, role });
    authDb.close();

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to list users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Verify admin authentication
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const { startup_name, email, password, role } = body || {};

    if (!startup_name || !email || !password) {
      return NextResponse.json({ error: "Startup name, email and password are required" }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const authDb = new AuthDatabaseService();
    
    // Check if email already exists
    const existing = authDb.getUserByEmail(email);
    if (existing) {
      authDb.close();
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const userId = authDb.createUser({
      startup_name,
      email,
      password_hash: passwordHash,
    });

    // Update role if provided
    if (role && role !== "user") {
      authDb.updateUser(userId, { role });
    }

    authDb.close();

    return NextResponse.json({ success: true, id: userId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to create user" }, { status: 500 });
  }
}
