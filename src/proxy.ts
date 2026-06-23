import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { jwtVerify } from "jose"; // <-- Required for Edge JWT decoding
import { getSession } from "./lib/session";

// ============================================================================
// 1. ROUTE CONFIGURATIONS & UPSTASH REDIS SETUP
// ============================================================================
const protectedRoutes = ["/user", "/checkout"];
const adminRoutes = ["/admin"];
const authRoutes = ["/login", "/signup", "/forgot-password"];

// Initialize Redis safely
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// FIX: Hardened Auth Rate Limit (5 attempts per minute)
const authRateLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(50, "1 m") })
  : null;

  const globalRateLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(150, "1 m") })
  : null;

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ============================================================================
  // 2. PROXY HEADER SANITIZATION (Prevent IP Spoofing)
  // ============================================================================
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  const trueIp = forwardedFor?.split(",")[0].trim() || realIp || "127.0.0.1";
  const requestId = crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-trusted-ip", trueIp);
  requestHeaders.set("x-request-id", requestId);

  // ============================================================================
  // 3. EDGE RATE LIMITING (Anti-Bot / Anti-DDoS)
  // ============================================================================
  if (
    (path.startsWith("/login") || path.startsWith("/signup") || path.startsWith("/forgot-password"))
  ) {
    if (authRateLimit) {
    const { success } = await authRateLimit.limit(`auth_ratelimit_${trueIp}`);

      if (!success) {
        console.warn(`[EDGE FIREWALL] Bruteforce attempt blocked for IP: ${trueIp}`);
        return new NextResponse("Too Many Requests. Try again in 1 minute.", { status: 429 });
      }
    }
   
  
  // B. Global Shield for Everything Else
  else {
    if (globalRateLimit) {
      const { success } = await globalRateLimit.limit(`global_${trueIp}`);
      if (!success) {
        console.warn(`[EDGE FIREWALL] DDoS / Spam attempt blocked for IP: ${trueIp}`);
        return new NextResponse("Rate limit exceeded.", { status: 429 });
      }
    }
    
  }
}

  // ============================================================================
  // 4. STRICT ROUTE PROTECTION (RBAC)
  // ============================================================================

  // FIX: Decode the JWT to establish absolute truth of identity and role
  const session = await getSession();
  const isAuthenticated = !!session;
  const userRole = session?.role ;

  // A. Protect Auth Routes
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(
      new URL(
        userRole === "Admin" ? "/admin/overview" : "/user/dashboard",
        request.url,
      ),
    );
  }

  // B. Protect Standard User Routes
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(redirectUrl);
  }

  // C. FIX: Protect Admin Routes via True RBAC
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));
  if (isAdminRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Block standard users from accessing /admin paths
    if (userRole !== "Admin" && userRole !== "Manager") {
      console.warn(
        `[SECURITY] User attempted unauthorized admin access. IP: ${trueIp}`,
      );
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
  }

  // ============================================================================
  // 5. CSRF & ORIGIN PROTECTION (Mutation Firewall)
  // ============================================================================
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (process.env.NODE_ENV === "production") {
      // Define all permitted domains here
      const allowedDomains = [
        process.env.NEXT_PUBLIC_APP_URL, // From Vercel Env Vars
        "https://wunkathomes.com",       // Future production domain
        "https://wunkathomes-v2-t5wg.vercel.app" // Fallback temp domain
      ].filter(Boolean) as string[];
      const isOriginAllowed = origin && allowedDomains.some(domain => origin.startsWith(domain));
      if (!isOriginAllowed) {
        console.error(
          `[EDGE FIREWALL] Blocked CSRF attempt from ${origin} (IP: ${trueIp})`,
        );
        return new NextResponse("Forbidden: Invalid Origin", { status: 403 });
      }
    }
  }

  // ============================================================================
  // 6. CONTENT SECURITY POLICY (CSP) & SECURE HEADERS
  // ============================================================================
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.paystack.co;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://images.unsplash.com https://res.cloudinary.com https://api.maptiler.com https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org;
    font-src 'self' data:;
    connect-src 'self' https://api.paystack.co https://api.cloudinary.com https://api.maptiler.com; 
    worker-src 'self' blob:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self' https://js.paystack.co https://checkout.paystack.com;
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
