"use server";

import { headers } from "next/headers";
import { getSession } from "@/lib/session";
import { connectToDatabase } from "@/config/DbConnect";
import Lease from "@/models/lease";
import Listing from "@/models/listing";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "crypto";
import { sendEmail } from "@/lib/resend";
import React from "react";
import mongoose from "mongoose";
import MoveOutConfirmationEmail from "@/components/email/move-out-confirmation-mail";

// NOTE: In a production environment, implement Redis-based rate limiting
// import { ratelimit } from "@/lib/redis";

// ============================================================================
// 1. STRICT INPUT VALIDATION SCHEMAS (ZOD)
// ============================================================================
const signLeaseSchema = z.object({
  leaseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Lease ID format"),
  typedSignature: z
    .string()
    .min(2, "Signature must be at least 2 characters")
    .max(100, "Signature is too long")
    .trim(),
});

const vacateSchema = z.object({
  leaseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Lease ID format"),
});

// ============================================================================
// 2. SERVER ACTIONS
// ============================================================================

export async function signLeaseAgreement(
  rawLeaseId: string,
  rawTypedSignature: string,
) {
  let ip = "unknown";
  let userId = "unknown";

  try {
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for")?.split(",")[0] || "Unknown IP";
    const userAgent = headersList.get("user-agent") || "Unknown Device";

    const session = await getSession();
    if (!session || !session.userId) {
      throw new Error("UNAUTHORIZED");
    }
    userId = session.userId;

    // const { success } = await ratelimit.limit(`sign_lease_${userId}`);
    // if (!success) throw new Error("RATE_LIMIT_EXCEEDED");

    const { leaseId, typedSignature } = signLeaseSchema.parse({
      leaseId: rawLeaseId,
      typedSignature: rawTypedSignature,
    });

    await connectToDatabase();

    const timestamp = new Date();

    const signaturePayload = `${leaseId}:${userId}:${typedSignature}:${ip}:${userAgent}:${timestamp.toISOString()}`;
    const documentHash = crypto
      .createHash("sha256")
      .update(signaturePayload)
      .digest("hex");

    const updatedLease = await Lease.findOneAndUpdate(
      {
        _id: leaseId,
        userId: userId,
        "signatureAudit.isSigned": { $ne: true },
      },
      {
        status: "Awaiting_Admin_Approval",
        signatureAudit: {
          isSigned: true,
          signedAt: timestamp,
          ipAddress: ip,
          userAgent: userAgent,
          typedName: typedSignature,
          documentHash: documentHash,
        },
      },
      { new: true },
    );

    if (!updatedLease) {
      return {
        success: false,
        error: "Lease not found, unauthorized, or already signed.",
      };
    }

    revalidatePath("/user/dashboard");

    return { success: true };
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED")
      return { success: false, error: "Unauthorized access." };
    if (error.message === "RATE_LIMIT_EXCEEDED")
      return {
        success: false,
        error: "Too many requests. Please try again later.",
      };

    console.error(
      `[SECURITY LOG] Signature Error (User: ${userId}, IP: ${ip}):`,
      error.message,
    );
    return {
      success: false,
      error:
        "Failed to apply digital signature. Please check your inputs and try again.",
    };
  }
}

export async function submitNoticeToVacate(rawLeaseId: string) {
  let ip = "unknown";
  let userId = "unknown";

  try {
    // 1. Capture Identity Footprint
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for")?.split(",")[0] || "Unknown IP";

    // 2. Zero-Trust Authorization
    const session = await getSession();
    if (!session || !session.userId) {
      throw new Error("UNAUTHORIZED");
    }
    userId = session.userId;

    // 3. Strict Payload Scrubbing
    const { leaseId } = vacateSchema.parse({ leaseId: rawLeaseId });

    await connectToDatabase();

    // 4. Fetch Lease & Verify Ownership (IDOR Protection)
    const lease = await Lease.findOne({
      _id: leaseId,
      userId: userId,
    })
      .populate("listingId", "title")
      .populate("userId", "name email");

    if (!lease) {
      return { success: false, message: "Lease not found or unauthorized." };
    }

    if (lease.intentToVacate) {
      return {
        success: false,
        message: "Notice to vacate has already been submitted.",
      };
    }

    // 5. ATOMIC TRANSACTION: Mongoose Recommended Pattern
    const dbSession = await mongoose.startSession();
    await dbSession.withTransaction(async () => {
      // Update Lease
      lease.intentToVacate = true;
      lease.moveOutDate = lease.endDate;
      await lease.save({ session: dbSession });

      // Instantly relist the property as Available
      await Listing.findByIdAndUpdate(
        lease.listingId._id,
        { status: "Available" },
        { session: dbSession },
      );
    });
    await dbSession.endSession();

    // 6. Fire and Forget Email (Outside transaction block)
    if (lease.userId?.email && lease.listingId?.title) {
      sendEmail({
        to: lease.userId.email,
        subject: `Move-Out Confirmed: ${lease.listingId.title}`,
        react: React.createElement(MoveOutConfirmationEmail, {
          userName: lease.userId.name,
          propertyTitle: lease.listingId.title,
          moveOutDate: lease.endDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        }),
      }).catch((emailError) => {
        console.error("[NON-FATAL] Move-out email failed to send:", emailError);
      });
    }

    // 7. Revalidate UI
    revalidatePath("/user/leases");
    revalidatePath("/admin/activations");

    return {
      success: true,
      message:
        "Notice to vacate submitted. Check your email for move-out instructions.",
    };
  } catch (error: any) {
    // 8. Secure Failure & Logging
    if (error.message === "UNAUTHORIZED")
      return { success: false, message: "Unauthorized access." };

    console.error(
      `[SECURITY LOG] Notice to Vacate Error (User: ${userId}, IP: ${ip}):`,
      error.message,
    );
    return { success: false, message: "An unexpected system error occurred." };
  }
}
