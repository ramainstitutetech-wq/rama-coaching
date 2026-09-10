import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "rama-coaching-secret-key-change-in-prod-2026";

async function decodeToken(token: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as { id?: string; role?: string; email?: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── /admin routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("rama_token")?.value;
    if (!token) return NextResponse.redirect(new URL("/admin/login", request.url));

    const payload = await decodeToken(token);
    if (!payload) {
      const res = NextResponse.redirect(new URL("/admin/login", request.url));
      res.cookies.delete("rama_token");
      return res;
    }

    // Staff trying to access admin panel → redirect to staff panel
    if (payload.role === "staff") {
      return NextResponse.redirect(new URL("/staff", request.url));
    }

    // Must be admin
    if (payload.role !== "admin") {
      const res = NextResponse.redirect(new URL("/admin/login", request.url));
      res.cookies.delete("rama_token");
      return res;
    }

    return NextResponse.next();
  }

  // ── /staff routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/staff") && !pathname.startsWith("/staff/login")) {
    const token = request.cookies.get("rama_token")?.value;
    if (!token) return NextResponse.redirect(new URL("/staff/login", request.url));

    const payload = await decodeToken(token);
    if (!payload) {
      const res = NextResponse.redirect(new URL("/staff/login", request.url));
      res.cookies.delete("rama_token");
      return res;
    }

    // Admin trying to access staff panel → redirect to admin panel
    if (payload.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (payload.role !== "staff") {
      const res = NextResponse.redirect(new URL("/staff/login", request.url));
      res.cookies.delete("rama_token");
      return res;
    }

    return NextResponse.next();
  }

  // ── /student routes ────────────────────────────────────────────────────────
  if (pathname.startsWith("/student")) {
    const token = request.cookies.get("student_token")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", request.url));

    const payload = await decodeToken(token);
    if (!payload) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete("student_token");
      return res;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/student/:path*"],
};
