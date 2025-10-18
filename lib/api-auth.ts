import { NextResponse } from "next/server";
import { requireUserSession, SessionUser } from "./session";

/**
 * Verify admin authentication for API routes
 * Returns the user if authenticated and admin, otherwise returns an error response
 */
export async function requireAdmin(): Promise<{ user: SessionUser } | { error: NextResponse }> {
  try {
    const user = await requireUserSession();
    
    if (user.role !== "admin") {
      return {
        error: NextResponse.json(
          { error: "Forbidden: Admin access required" },
          { status: 403 }
        ),
      };
    }
    
    return { user };
  } catch (e) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized: Please login" },
        { status: 401 }
      ),
    };
  }
}

/**
 * Verify user authentication for API routes (any authenticated user)
 */
export async function requireAuth(): Promise<{ user: SessionUser } | { error: NextResponse }> {
  try {
    const user = await requireUserSession();
    return { user };
  } catch (e) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized: Please login" },
        { status: 401 }
      ),
    };
  }
}
