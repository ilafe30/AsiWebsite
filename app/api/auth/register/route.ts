import { NextResponse } from "next/server";
import { AuthDatabaseService } from "@/lib/database";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { startupName, email, password } = body as {
      startupName?: string;
      email?: string;
      password?: string;
    };

    if (!startupName || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const authDb = new AuthDatabaseService();

    const existing = authDb.getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const userId = authDb.createUser({ startup_name: startupName, email, password_hash: passwordHash });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    authDb.createVerificationToken(userId, token, expiresAt);

    // Try all possible URL env vars, preferring NEXT_PUBLIC_APP_URL if set
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   process.env.BASE_URL || 
                   process.env.VERCEL_URL || 
                   "http://localhost:3000";
                   
    // Ensure URL has http/https prefix
    const publicUrl = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
    
    // Build verification URL with encoded token
    const verifyUrl = `${publicUrl}/api/auth/verify?token=${encodeURIComponent(token)}`;

    await sendVerificationEmail({ to: email, verifyUrl, startupName });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", details: err?.message }, { status: 500 });
  }
}



