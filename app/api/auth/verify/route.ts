import { NextResponse } from "next/server";
import { AuthDatabaseService } from "@/lib/database";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const authDb = new AuthDatabaseService();
  const record = authDb.getVerificationToken(token);
  if (!record) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const now = new Date();
  const exp = new Date(record.expires_at);
  if (now > exp) {
    authDb.deleteVerificationToken(record.id);
    return NextResponse.json({ error: "Token expired" }, { status: 400 });
  }

  authDb.markEmailVerified(record.user_id);
  authDb.deleteVerificationToken(record.id);

  return NextResponse.redirect(new URL("/login?verified=1", request.url));
}



