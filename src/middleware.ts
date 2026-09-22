import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.next();
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");
    // Verify token
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    // Sliding Session Logic for Admin/Manager
    if (['Admin', 'Manager'].includes(role)) {
      // Re-sign a new JWT token to push the expiration out another 10 minutes
      const newToken = await new SignJWT({ 
          userId: payload.userId, 
          email: payload.email, 
          role: payload.role 
        })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('10m')
        .sign(secret);

      // We must create the response first to modify its cookies in middleware
      const response = NextResponse.next();
      
      response.cookies.set({
        name: 'auth-token',
        value: newToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'lax',
        maxAge: 10 * 60, // 10 minutes
        path: '/',
      });
      
      return response;
    }

    // For standard users (30 days), we don't need aggressive sliding on every request.
    return NextResponse.next();

  } catch (error) {
    // If the token is invalid or expired (e.g., Admin was inactive for > 10m)
    // We clear the cookie.
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/dashboard');
    
    let response;
    if (isProtectedRoute) {
        // Redirect to login if they try to access a protected page with an expired session
        response = NextResponse.redirect(new URL('/login', request.url));
    } else {
        // Just clear the token and let them view public pages
        response = NextResponse.next();
    }
    
    response.cookies.delete('auth-token');
    return response;
  }
}

// Ensure middleware only runs on relevant paths (not static assets or API routes if unnecessary)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, fonts, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
