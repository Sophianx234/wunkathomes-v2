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
  moveOutDate: z.string().datetime().optional(),
  vacateReason: z.string().optional(),
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

export async function submitNoticeToVacate(rawLeaseId: string, rawMoveOutDate?: string, rawVacateReason?: string) {
  let ip = "unknown";
  let userId = "unknown";

  try {
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for")?.split(",")[0] || "Unknown IP";

    const session = await getSession();
    if (!session || !session.userId) {
      throw new Error("UNAUTHORIZED");
    }
    userId = session.userId;

    const { leaseId, moveOutDate, vacateReason } = vacateSchema.parse({ 
      leaseId: rawLeaseId,
      moveOutDate: rawMoveOutDate,
      vacateReason: rawVacateReason
    });

    await connectToDatabase();

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

    const dbSession = await mongoose.startSession();
    await dbSession.withTransaction(async () => {
      lease.intentToVacate = true;
      lease.moveOutDate = moveOutDate ? new Date(moveOutDate) : lease.endDate;
      lease.vacateReason = vacateReason || "Not provided";
      await lease.save({ session: dbSession });

      await Listing.findByIdAndUpdate(
        lease.listingId._id,
        { status: "Available" },
        { session: dbSession },
      );
    });
    await dbSession.endSession();

    if (lease.userId?.email && lease.listingId?.title) {
      sendEmail({
        to: lease.userId.email,
        subject: `Move-Out Request Received: ${lease.listingId.title}`,
        react: React.createElement(MoveOutConfirmationEmail, {
          userName: lease.userId.name,
          propertyTitle: lease.listingId.title,
          moveOutDate: lease.moveOutDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        }),
      }).catch((emailError) => {
        console.error("[NON-FATAL] Move-out email failed to send:", emailError);
      });
    }

    revalidatePath("/user/dashboard");
    revalidatePath("/admin/manage/tenants");

    return {
      success: true,
      message: "Notice to vacate submitted. Check your email for move-out instructions.",
    };
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED")
      return { success: false, message: "Unauthorized access." };

    console.error(`[SECURITY LOG] Notice to Vacate Error:`, error.message);
    return { success: false, message: "An unexpected system error occurred." };
  }
}
