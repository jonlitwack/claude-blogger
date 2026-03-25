import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /write routes — require auth
  if (pathname.startsWith("/write")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const signInUrl = new URL("/api/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Redirect to /setup if not configured (check cookie)
  if (pathname.startsWith("/write") || pathname.startsWith("/api/essays") || pathname.startsWith("/api/upload")) {
    const setupComplete = req.cookies.get("setup_complete");
    if (!setupComplete) {
      // For API routes, return an error; for pages, redirect
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Setup not complete. Visit /setup to configure." },
          { status: 400 }
        );
      }
      return NextResponse.redirect(new URL("/setup", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/write/:path*", "/api/essays/:path*", "/api/upload/:path*"],
};
