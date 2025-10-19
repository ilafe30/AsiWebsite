import { NextResponse } from "next/server";
import { AuthDatabaseService } from "@/lib/database";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    console.log("[Login API] Starting login attempt");
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };
    if (!email || !password) {
      console.log("[Login API] Missing credentials");
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const authDb = new AuthDatabaseService();
    console.log("[Login API] Looking up user:", email);
    const user = authDb.getUserByEmail(email);
    console.log("[Login API] User found:", user ? "yes" : "no", "Role:", user?.role);
    
    if (!user) {
      console.log("[Login API] User not found");
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    console.log("[Login API] Verifying password");
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      console.log("[Login API] Invalid password");
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    
    console.log("[Login API] Password valid, creating session");
    const session = await getSession();
    session.user = {
      id: user.id,
      email: user.email,
      startupName: user.startup_name,
      emailVerified: !!user.email_verified,
      role: (user.role as any) === 'admin' ? 'admin' : 'user',
    };
    console.log("[Login API] Session user data:", session.user);
    await session.save();
    console.log("[Login API] Session saved");

    const redirectTo = session.user.role === 'admin' ? '/admin' : '/dashboardfortheuser';
    return NextResponse.json({ success: true, redirectTo });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", details: err?.message }, { status: 500 });
  }
}



