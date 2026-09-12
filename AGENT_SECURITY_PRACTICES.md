# Next.js Agent Security Implementation Guide

This document outlines the standard security practices and implementations that have been applied to this project. Future agents should use this guide as a reference when implementing security for new Next.js projects to ensure a hardened, enterprise-grade architecture.

## 1. Strict Server-Side Validation (Zod)
Client-side validation is insufficient. All data collected by the server (via API routes or Server Actions) must be strictly validated before business logic executes.

**Implementation Strategy:**
- Define centralized schemas in a shared library (e.g., `src/lib/validations.ts`).
- For API routes, parse `req.json()` or `FormData` using `schema.safeParse()`.
- Return a `400 Bad Request` immediately if `!validatedData.success`.
- Extract and use only the strongly typed variables from `validatedData.data` moving forward.

## 2. Comprehensive Security Headers (Middleware)
Use Next.js Edge Middleware to attach helmet-style security headers globally to all pages and API routes.

**Required Headers:**
- `X-Frame-Options: DENY` - Prevents Clickjacking.
- `X-Content-Type-Options: nosniff` - Prevents MIME-sniffing.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` - Enforces HTTPS.
- `Referrer-Policy: strict-origin-when-cross-origin` - Secures referrer information.
- `Content-Security-Policy (CSP)` - Restricts sources for scripts, styles, frames, and connections (ensure 3rd-party integrations like payment gateways are whitelisted).

## 3. Dynamic CSRF Protection for API Mutations
Do not rely solely on cookies for API security. Ensure Cross-Site Request Forgery (CSRF) protection is handled dynamically at the edge without breaking deployments.

**Implementation Strategy:**
- In the middleware, intercept all mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`) hitting `/api/*`.
- Extract the `Origin`, `Referer`, and `Host` headers.
- Dynamically parse the `Origin`/`Referer` and compare their hostname against the incoming `Host` header. This standardizes CSRF protection across local development and diverse production domains without relying on brittle, hardcoded `.env` origin arrays.
- Return a `403 Forbidden` if there is a mismatch or missing headers in production.

## 4. Edge Rate Limiting (DDoS & Brute-Force Mitigation)
APIs must be protected from high-volume automated attacks.

**Implementation Strategy:**
- Use a globally distributed Edge data store like Upstash Redis (`@upstash/ratelimit`).
- Implement a sliding window rate limit in the Next.js Middleware (e.g., 100 requests per 10 seconds per IP).
- Track the client IP via `req.ip` or the `x-forwarded-for` header.
- Return `429 Too Many Requests` when limits are exceeded.

## 5. Immediate Access Revocation (Stateless JWTs)
Since JWTs are stateless and cannot be naturally invalidated until they expire, you must build a high-speed revocation layer.

**Implementation Strategy:**
- When an administrator revokes access (e.g., suspends an account), immediately push the `userId` to a Redis Set (e.g., `redis.sadd("suspended_users", userId)`).
- Inside the Edge middleware, after decoding the JWT, perform a microsecond check against the Redis Set (`redis.sismember`).
- If the user is found in the blocklist, instantly clear their authentication cookie and return a `403 Forbidden` or redirect to login.

## 6. Audit & Access Logging
Ensure all inbound traffic and its resolution is actively monitored with a clean, highly readable console output format.

**Implementation Strategy:**
- Implement a formatted logging utility within the middleware.
- Log the HTTP Method, Route Path, Requester IP, Resolved User Role, and the final action taken by the middleware.
- Example standard format: `[14:32:05] 🌐 POST   /api/orders/track         => 🛡️ ALLOWED (Role: guest, IP: 127.0.0.1)`
- This creates immediate, human-readable visibility into unauthorized access attempts or triggered rate limits directly in the server console.

## 7. Secure & Optimized Cloudinary Asset Management
Prevent storage bloating, orphan files, and bandwidth exhaustion by managing media files deterministically.

**Implementation Strategy:**
- **Upload Optimization**: Enforce transformation at upload-time (e.g., limit dimensions to `1200x1200px` with `crop: "limit"`, force formats to `webp`, and use `q_auto`) to stop massive, malicious, or poorly compressed files from inflating storage.
- **Deterministic Organization**: Store entities in heavily nested and predictable folders. Use a naming convention tied to DB IDs (e.g., `products/{slug}/img_1`). If an image is updated, the deterministic `public_id` ensures the old image is securely overwritten rather than creating orphaned duplicates.
- **Garbage Collection**: Always hook into `PUT` (update) and `DELETE` (destroy) API routes to proactively run `cloudinary.uploader.destroy()` or `cloudinary.api.delete_folder()` on removed media. Never leave abandoned assets in the cloud.
- **Array Limits**: Hardcode constraints (e.g., max 5 images per product) early in API handlers (and enforce them via Zod) before streaming buffers to Cloudinary to prevent array-flooding attacks.

## 8. Hardened Authentication Cookies (XSS Protection)
JWTs must never be accessible via client-side JavaScript. Storing tokens in `localStorage` or accessible cookies exposes the application to severe Cross-Site Scripting (XSS) session theft.

**Implementation Strategy:**
- Always issue JWTs inside cookies using the server-side `NextResponse.cookies.set()` method.
- Enforce `httpOnly: true` to make it mathematically impossible for JavaScript to read the token.
- Enforce `secure: process.env.NODE_ENV === "production"` to ensure transmission occurs exclusively over HTTPS.
- Enforce `sameSite: "strict"` to prevent the browser from sending the cookie during cross-origin requests, further mitigating CSRF attacks.

## 9. Mandatory 2FA for Privileged Roles
Accounts with destructive or broad permissions (Admins, Managers) must not rely on passwords alone, as passwords can be compromised via phishing or external data breaches.

**Implementation Strategy:**
- **Intercept Login:** During the primary login flow (`POST /api/auth/login`), verify the password but *defer* issuing the JWT if the `user.role` is highly privileged.
- **Generate & Send OTP:** Generate a secure One-Time Password (OTP), store it securely in the database with an expiration time, and email it to the user.
- **Halt Flow:** Return a response like `{ requiresOtp: true }` to command the frontend UI to switch to an OTP input view.
- **Verify & Issue:** Create a dedicated secondary route (`POST /api/auth/login/verify-otp`) to accept the OTP. Only after successful verification should the system issue the `HttpOnly` token cookie.
- **Audit Log:** Permanently log successful 2FA logins to the database for security auditing.

## 10. Third-Party SDK & Dual CSP Synchronization
When integrating 3rd-party services (e.g., MapTiler, Paystack) that rely on external assets or Web Workers, you must synchronize Content-Security-Policies across all entry points.

**Implementation Strategy:**
- Ensure wildcard domains (e.g., `https://*.maptiler.com`) and CDN fallbacks (e.g., `https://unpkg.com`) are explicitly whitelisted in `worker-src`, `child-src`, `img-src`, and `connect-src`.
- If a CSP is defined in `next.config.ts` AND `middleware.ts`, the browser enforces the strict intersection of both. Always ensure BOTH files contain identical whitelists to prevent production-only blockages where CDN fallbacks execute.
- Always use `blob:` in `worker-src` and `child-src` for SDKs that instantiate their own Web Workers (like MapLibre).

## 11. Next.js App Router Scroll Management
Never use "auto scroll" hacks (like `useEffect(() => window.scrollTo(0,0))`) to fix layout scroll behavior in the Next.js App Router.

**Implementation Strategy:**
- When using Sticky headers in persistent layouts, Next.js naturally scrolls to the top of the changing route segment (cutting off the header visually).
- Fix this exclusively using the Next.js standard approach by enabling `experimental: { scrollRestoration: true }` in `next.config.ts`. This utilizes the browser's native History API to enforce an absolute `(0,0)` scroll reset on new page loads while perfectly restoring scroll height on Back/Forward navigation.
