import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const url = new URL(request.url);
  console.log("[Middleware] Checking path:", url.pathname);
  
  const isProtected = url.pathname.startsWith("/dashboardfortheuser") || 
                   url.pathname.startsWith("/admin");
  console.log("[Middleware] Is protected route:", isProtected);
  
  if (!isProtected) return NextResponse.next();

  // Local testing bypass: set TEST_BYPASS_AUTH=1 in .env.local
  if (process.env.TEST_BYPASS_AUTH === "1") {
    console.log("[Middleware] Auth bypass enabled");
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("asi_app_session");
  console.log("[Middleware] Session cookie present:", !!sessionCookie);
  if (sessionCookie) {
    console.log("[Middleware] Cookie value exists:", !!sessionCookie.value);
  }

  if (!sessionCookie?.value) {
    console.log("[Middleware] No valid session, redirecting to login");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  console.log("[Middleware] Session found, allowing access");
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboardfortheuser/:path*", "/admin/:path*", "/api/trainings/:path*"],
};



