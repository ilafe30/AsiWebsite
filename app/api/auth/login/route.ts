import { NextResponse } from "next/server";
import { AuthDatabaseService } from "@/lib/database";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };
    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const authDb = new AuthDatabaseService();
    const user = authDb.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!user.email_verified) {
      return NextResponse.json({ error: "Email not verified" }, { status: 403 });
    }

    const session = await getSession();
    session.user = {
      id: user.id,
      email: user.email,
      startupName: user.startup_name,
      emailVerified: !!user.email_verified,
      role: (user.role as any) === 'admin' ? 'admin' : 'user',
    };
    await session.save();

    const redirectTo = session.user.role === 'admin' ? '/admin' : '/dashboardfortheuser';
    return NextResponse.json({ success: true, redirectTo });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", details: err?.message }, { status: 500 });
  }
}



