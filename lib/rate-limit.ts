import { NextRequest, NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export function rateLimit(
  req: NextRequest,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000
): NextResponse | null {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || userLimit.expiresAt <= now) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
    return null;
  }

  if (userLimit.count >= maxRequests) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((userLimit.expiresAt - now) / 1000)),
        },
      }
    );
  }

  userLimit.count++;
  return null;
}
