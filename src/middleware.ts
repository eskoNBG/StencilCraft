import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Simple auth check: if no session token cookie, redirect to signin
  const token =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!token) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/api/gallery/:path*"],
};
