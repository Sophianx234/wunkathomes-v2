"use server"

import { headers } from "next/headers"
import { getSession } from "@/lib/session"
import { connectToDatabase } from "@/config/DbConnect"
import Lease from "@/models/lease"
import { revalidatePath } from "next/cache"

export async function signLeaseAgreement(leaseId: string, typedSignature: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Unauthorized access." };
    }

    await connectToDatabase();

    // 1. Capture the exact digital footprint
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for")?.split(',')[0] || "Unknown IP";
    const userAgent = headersList.get("user-agent") || "Unknown Device";
    const timestamp = new Date();

    // 2. Cryptographic Hash (Simulated for this example, you can use crypto library later)
    const documentHash = `WUNKAT-DOC-${leaseId}-${timestamp.getTime()}`;

    // 3. Atomically update the lease
    const updatedLease = await Lease.findOneAndUpdate(
      { 
        _id: leaseId, 
        userId: session.userId,
        "signatureAudit.isSigned": false // Prevent double-signing
      },
      {
        status: 'Active',
        signatureAudit: {
          isSigned: true,
          signedAt: timestamp,
          ipAddress: ipAddress,
          userAgent: userAgent,
          typedName: typedSignature,
          documentHash: documentHash
        }
      },
      { new: true }
    );

    if (!updatedLease) {
      return { success: false, error: "Lease not found or already signed." };
    }

    // 4. Purge the cache so the dashboard immediately shows the active state
    revalidatePath("/user/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Signature Error:", error);
    return { success: false, error: "Failed to apply digital signature." };
  }
}