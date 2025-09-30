import { getIronSession, type IronSession, type IronSessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionUser = {
  id: number;
  email: string;
  startupName: string;
  emailVerified: boolean;
  role: "user" | "admin";
};

export type AppSession = IronSession<{ user?: SessionUser; lastActiveAt?: number }>; 

const sessionPassword = process.env.SESSION_PASSWORD as string;

if (!sessionPassword) {
  // Intentionally not throwing to avoid breaking build; but warn prominently
  // eslint-disable-next-line no-console
  console.warn("SESSION_PASSWORD is not set. Please set a strong secret in your env file.");
}

export const sessionOptions: IronSessionOptions = {
  password: sessionPassword || "insecure-development-only-password-change-me", // dev fallback
  cookieName: "asi_app_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // 30 minutes
    maxAge: 60 * 30,
  },
};

export async function getSession(): Promise<AppSession> {
  const cookieStore = await cookies();
  const session = await getIronSession<{ user?: SessionUser; lastActiveAt?: number }>(cookieStore, sessionOptions);

  // Inactivity timeout: if lastActiveAt is older than 30 min, destroy session
  const now = Date.now();
  const THIRTY_MIN_MS = 30 * 60 * 1000;
  if (session.lastActiveAt && now - session.lastActiveAt > THIRTY_MIN_MS) {
    session.destroy();
  } else {
    // Touch activity timestamp
    session.lastActiveAt = now;
    await session.save();
  }
  return session as AppSession;
}

export async function requireUserSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session.user) {
    throw new Error("UNAUTHENTICATED");
  }
  return session.user;
}



