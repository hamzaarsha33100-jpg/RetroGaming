import { NextRequest, NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

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
  const windowStart = now - windowMs;

  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || userLimit.resetTime < windowStart) {
    rateLimitMap.set(ip, { count: 1, resetTime: now });
    return null;
  }

  if (userLimit.count >= maxRequests) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((userLimit.resetTime - now) / 1000)),
        },
      }
    );
  }

  userLimit.count++;
  return null;
}

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now - 15 * 60 * 1000) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000);
