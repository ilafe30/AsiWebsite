import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const isProtected = url.pathname.startsWith("/dashboardfortheuser");
  if (!isProtected) return NextResponse.next();

  // Local testing bypass: set TEST_BYPASS_AUTH=1 in .env.local
  if (process.env.TEST_BYPASS_AUTH === "1") {
    return NextResponse.next();
  }

  const hasSession = request.cookies.get("asi_app_session");
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", url.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboardfortheuser/:path*"],
};



