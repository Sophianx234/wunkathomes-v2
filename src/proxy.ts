import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ============================================================================
// 1. ROUTE CONFIGURATIONS & UPSTASH REDIS SETUP
// ============================================================================
const protectedRoutes = ["/user", "/properties/[slug]"]; // Require any logged-in user
const adminRoutes = ["/admin"]; // Require Admin/Manager role
const authRoutes = ["/login", "/signup", "/forgot-password"]; // Redirect to dashboard if already logged in
const SESSION_COOKIE_NAME = "auth-token"; // Ensure this matches your createSession cookie name

// Initialize Redis safely (only active if env vars are present)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Create a sliding window rate limiter: 5 requests per 10 seconds per IP
const authRateLimit = redis 
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "10 s") }) 
  : null;

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ============================================================================
  // 2. PROXY HEADER SANITIZATION (Prevent IP Spoofing)
  // ============================================================================
  // Extract the true IP from Vercel's trusted headers and lock it in a new header
  const trueIp = request.ip || request.headers.get("x-real-ip") || "127.0.0.1";
  const requestId = crypto.randomUUID(); 

  // Clone headers to pass down to your Server Actions
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-trusted-ip", trueIp);
  requestHeaders.set("x-request-id", requestId);

  // ============================================================================
  // 3. EDGE RATE LIMITING (Anti-Bot / Anti-DDoS)
  // ============================================================================
  // Aggressively rate-limit login and signup routes at the Edge before hitting the DB
  if (authRateLimit && (path.startsWith("/login") || path.startsWith("/signup"))) {
    const { success } = await authRateLimit.limit(`auth_ratelimit_${trueIp}`);
    if (!success) {
      console.warn(`[EDGE FIREWALL] Rate limit exceeded for IP: ${trueIp}`);
      return new NextResponse("Too Many Requests. Please try again later.", { status: 429 });
    }
  }

  // ============================================================================
  // 4. STRICT ROUTE PROTECTION (RBAC)
  // ============================================================================
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = !!sessionCookie; 
  
  // A. Protect Auth Routes (Logged-in users shouldn't see the login page)
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/user/dashboard", request.url));
  }

  // B. Protect Standard User Routes
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("callbackUrl", path); // Smart redirect after login
    return NextResponse.redirect(redirectUrl);
  }

  // C. Protect Admin Routes (Basic edge check)
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));
  if (isAdminRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ============================================================================
  // 5. CSRF & ORIGIN PROTECTION (Mutation Firewall)
  // ============================================================================
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (process.env.NODE_ENV === "production") {
      const allowedDomain = "https://your-production-domain.com"; // UPDATE THIS BEFORE LAUNCH
      if (origin && !origin.startsWith(allowedDomain)) {
        console.error(`[EDGE FIREWALL] Blocked CSRF attempt from ${origin} (IP: ${trueIp})`);
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
    img-src 'self' blob: data: https://images.unsplash.com https://res.cloudinary.com;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self' https://js.paystack.co;
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim(); 

  // Pass the sanitized request headers forward
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Attach Security Headers to the outgoing response
  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};