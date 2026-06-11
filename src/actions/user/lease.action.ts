"use server"

import { headers } from "next/headers"
import { getSession } from "@/lib/session"
import { connectToDatabase } from "@/config/DbConnect"
import Lease from "@/models/lease"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import crypto from "crypto"

// NOTE: In a production environment, implement Redis-based rate limiting
// import { ratelimit } from "@/lib/redis";

// ============================================================================
// 1. STRICT INPUT VALIDATION SCHEMA (ZOD)
// ============================================================================
const signLeaseSchema = z.object({
  leaseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Lease ID format"),
  typedSignature: z.string()
    .min(2, "Signature must be at least 2 characters")
    .max(100, "Signature is too long")
    .trim(),
});

// ============================================================================
// 2. SERVER ACTION
// ============================================================================
export async function signLeaseAgreement(rawLeaseId: string, rawTypedSignature: string) {
  let ip = "unknown";
  let userId = "unknown";

  try {
    // 1. Capture the exact digital footprint (Async Headers)
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for")?.split(',')[0] || "Unknown IP";
    const userAgent = headersList.get("user-agent") || "Unknown Device";

    // 2. RBAC & Identity Verification
    const session = await getSession();
    if (!session || !session.userId) {
      throw new Error("UNAUTHORIZED");
    }
    userId = session.userId;

    // 3. Rate Limiting (Prevent signing spam)
    // const { success } = await ratelimit.limit(`sign_lease_${userId}`);
    // if (!success) throw new Error("RATE_LIMIT_EXCEEDED");

    // 4. Strict Input Validation
    const { leaseId, typedSignature } = signLeaseSchema.parse({
      leaseId: rawLeaseId,
      typedSignature: rawTypedSignature
    });

    await connectToDatabase();

    const timestamp = new Date();

    // 5. True Cryptographic Hash (Non-repudiation)
    // We hash the combination of Who, What, When, and Where. If ANY of this data 
    // is altered in the database later, re-hashing will not match, proving tampering.
    const signaturePayload = `${leaseId}:${userId}:${typedSignature}:${ip}:${userAgent}:${timestamp.toISOString()}`;
    const documentHash = crypto.createHash("sha256").update(signaturePayload).digest("hex");

    // 6. Atomically update the lease (IDOR & Double-Sign Prevention built-in)
    const updatedLease = await Lease.findOneAndUpdate(
      { 
        _id: leaseId, 
        userId: userId, // IDOR Prevention: Ensure they own this exact lease
        "signatureAudit.isSigned": { $ne: true } // Graceful double-sign prevention
      },
      {
        status: 'Awaiting_Admin_Approval', 
        signatureAudit: {
          isSigned: true,
          signedAt: timestamp,
          ipAddress: ip,
          userAgent: userAgent,
          typedName: typedSignature,
          documentHash: documentHash
        }
      },
      { new: true }
    );

    if (!updatedLease) {
      return { success: false, error: "Lease not found, unauthorized, or already signed." };
    }

    // 7. Purge the cache
    revalidatePath("/user/dashboard");

    return { success: true };

  } catch (error: any) {
    // 8. Secure Failure Handling
    if (error.message === "UNAUTHORIZED") return { success: false, error: "Unauthorized access." };
    if (error.message === "RATE_LIMIT_EXCEEDED") return { success: false, error: "Too many requests. Please try again later." };
    
    // Log the exact error with context for your backend engineers, but return a generic string to the frontend
    console.error(`[SECURITY LOG] Signature Error (User: ${userId}, IP: ${ip}):`, error.message);
    return { success: false, error: "Failed to apply digital signature. Please check your inputs and try again." };
  }
}