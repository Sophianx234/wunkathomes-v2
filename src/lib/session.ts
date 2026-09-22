// src/lib/session.ts
import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose";

export interface SessionPayload {
  userId: string | object;
  email: string;
  role: string;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");
    const { payload } = await jwtVerify(token, secret);
    
    // Typecast the generic Jose payload to your specific user object
    return payload as { userId: string; email: string; role: string; name?: string };
  } catch (error) {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const isAdminOrManager = ["Admin", "Manager"].includes(payload.role);
  
  // 10 minutes for Admin/Manager, 30 days for standard Users
  const expirationStr = isAdminOrManager ? "10m" : "30d";
  const maxAgeInSeconds = isAdminOrManager ? 10 * 60 : 30 * 24 * 60 * 60; 

  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");
  
  // 1. Create JWT token using jose (Edge compatible)
  const token = await new SignJWT({ ...payload as any })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expirationStr)
    .sign(secret);

  // 2. Set cookie
  const cookieStore = await cookies();
  
  cookieStore.set({
    name: "auth-token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: maxAgeInSeconds,
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
}
