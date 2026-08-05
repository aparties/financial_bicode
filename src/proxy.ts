import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./lib/auth-utils";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Let public routes, static assets, and next internals bypass proxy
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api/auth") ||
    path === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const isLoginPage = path === "/login";

  // Retrieve the session cookie
  const cookie = request.cookies.get("session")?.value;
  const session = verifySession(cookie);

  // If not authenticated, redirect to /login (or return 401 for API requests)
  if (!session) {
    if (isLoginPage) {
      return NextResponse.next();
    }
    
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If authenticated and on login page, redirect to dashboard (/)
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Config to specify matching routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (like images, robots.txt, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
};
