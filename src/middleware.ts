import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/server/lib/jwt";

// Paths that require authentication (any role: USER or ADMIN)
const AUTH_REQUIRED = [
  "/cart",
  "/checkout",
  "/orders",
  "/profile",
  "/wishlist",
];

// Paths that require ADMIN role
const ADMIN_REQUIRED = ["/admin"];

// Paths for unauthenticated users only (redirect logged-in users away)
const GUEST_ONLY = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  let user = null;
  if (token) {
    user = await verifyAccessToken(token);
  }

  // Redirect authenticated users away from guest-only pages
  if (GUEST_ONLY.some((p) => pathname.startsWith(p))) {
    if (user) {
      const dest = user.role === "ADMIN" ? "/admin" : "/";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  // Protect admin routes
  if (ADMIN_REQUIRED.some((p) => pathname.startsWith(p))) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
      );
    }
    if (user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Protect user-only routes
  if (AUTH_REQUIRED.some((p) => pathname.startsWith(p))) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public|uploads).*)",
  ],
};
