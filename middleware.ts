import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: { user?: { role?: string; isActive?: boolean } } | null }) => {
  const { pathname } = req.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const session = req.auth;
    if (!session?.user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (session.user.isActive === false) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protect account routes
  if (pathname.startsWith("/account") || pathname.startsWith("/checkout")) {
    const session = req.auth;
    if (!session?.user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*"],
};

// Force middleware to use Node.js runtime instead of Edge
export const runtime = 'nodejs';
