// src/lib/session.ts
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { jwtVerify } from "jose";

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
  // 1. Create JWT token
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "7d" }
  )

  // 2. Set cookie
  const cookieStore = await cookies()
  
  cookieStore.set({
    name: "auth-token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}


export async function deleteSession() {
  const cookieStore = await cookies()
  
  cookieStore.delete("auth-token")
}
