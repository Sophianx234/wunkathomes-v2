"use server";

import { getSession } from "@/lib/session";
import { connectToDatabase } from "@/config/DbConnect";
import mongoose from "mongoose";
import { z } from "zod";
import User from "@/models/user";
import Lease from "@/models/lease";
import '@/models/listing';
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/resend";
import React from "react";
import ApplicationStatusEmail from "@/components/email/application-status-mail";
import LeaseActivationEmail from "@/components/email/lease-activation-mail";

// ============================================================================
// 1. STRICT INPUT VALIDATION SCHEMAS (ZOD)
// ============================================================================
const actionSchema = z.object({
  leaseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Lease ID format"),
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID format"),
});

const activateSchema = z.object({
  leaseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Lease ID format"),
});

// ============================================================================
// 2. SERVER ACTIONS
// ============================================================================



// --- 2. ACTIVATE LEASE & GENERATE PIN ---
export async function activateLeaseAndGeneratePin(rawLeaseId: string) {
  let session;
  try {
    session = await getSession();
    if (!session?.userId || !['Admin', 'Manager'].includes(session.role)) {
      throw new Error("Unauthorized access attempt.");
    }

    const { leaseId } = activateSchema.parse({ leaseId: rawLeaseId });

    await connectToDatabase();

    // Cryptographically secure PIN generation (Zero-Trust over Math.random)
    const generatedPin = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(n => (n % 10).toString())
      .join('');

    const updatedLease = await Lease.findByIdAndUpdate(
      leaseId, 
      {
        status: 'Active',
        smartLockPin: generatedPin
      }, 
      { new: true }
    )
    .select('+smartLockPin')
    .populate('userId', 'email name') 
    .populate('listingId', 'title');  

    if (!updatedLease) {
      return { success: false, error: "Lease not found." };
    }

    const targetEmail = updatedLease.userId?.email;
    const propertyTitle = updatedLease.listingId?.title;

    if (targetEmail && propertyTitle) {
      await sendEmail({
        to: targetEmail,
        subject: `Lease Active: ${propertyTitle}`,
        react: React.createElement(LeaseActivationEmail, { 
          pin: generatedPin, 
          propertyTitle: propertyTitle 
        })
      });
    }

    revalidatePath("/admin/activations");
    return { success: true, pin: generatedPin, message: "PIN synced and lease activated." };

  } catch (error: any) {
    console.error(`[SECURITY LOG] Activate Lease Failed (Admin: ${session?.userId}):`, error.message);
    return { success: false, error: "An internal error occurred." };
  }
}

// --- 3. REJECT TENANT PAPERWORK (ATOMIC TRANSACTION) ---
export async function approveTenantPaperwork(rawLeaseId: string, rawUserId: string) {
  let session;
  try {
    session = await getSession();
    if (!session?.userId || !['Admin', 'Manager'].includes(session.role)) {
      throw new Error("Unauthorized access attempt.");
    }

    const { leaseId, userId } = actionSchema.parse({ leaseId: rawLeaseId, userId: rawUserId });

    await connectToDatabase();

    const dbSession = await mongoose.startSession();
    
    // 1. Transaction Block (Returns object on success, throws on failure)
    const result = await dbSession.withTransaction(async () => {
      const user = await User.findByIdAndUpdate(
        userId, 
        { kycStatus: 'Verified' }, 
        { new: true, session: dbSession }
      );
      
      const lease = await Lease.findByIdAndUpdate(
        leaseId, 
        { 
          'signatureAudit.isSigned': true,
          status: 'Awaiting_Admin_Approval' 
        },
        { new: true, session: dbSession }
      ).populate('listingId', 'title'); 

      // If these fail, it throws to the outer catch block
      if (!lease || !user) throw new Error("RECORD_NOT_FOUND");
      if (!lease.listingId) throw new Error("LISTING_NOT_FOUND");

      return { user, lease };
    });

    await dbSession.endSession();

    // 2. We can now safely assume `result` is the { user, lease } object
    // @ts-ignore
    const propertyTitle = result.lease.listingId.title;

    await sendEmail({
      to: result.user.email,
      subject: `Application Approved: ${propertyTitle}`,
      react: React.createElement(ApplicationStatusEmail, { 
        userName: result.user.name, 
        propertyTitle: propertyTitle, 
        isApproved: true 
      })
    });

    revalidatePath("/admin/activations");
    return { success: true, message: "Legal paperwork approved successfully." };

  } catch (error: any) {
    // 3. Handle the specific transaction throws here!
    if (error.message === "RECORD_NOT_FOUND") return { success: false, error: "Record not found." };
    if (error.message === "LISTING_NOT_FOUND") return { success: false, error: "Corrupted lease data." };

    console.error(`[SECURITY LOG] Approve Paperwork Failed (Admin: ${session?.userId}):`, error.message);
    return { success: false, error: "An internal error occurred." };
  }
}

export async function rejectTenantPaperwork(rawLeaseId: string, rawUserId: string) {
  let session;
  try {
    session = await getSession();
    if (!session?.userId || !['Admin', 'Manager'].includes(session.role)) {
      throw new Error("Unauthorized access attempt.");
    }

    const { leaseId, userId } = actionSchema.parse({ leaseId: rawLeaseId, userId: rawUserId });

    await connectToDatabase();

    const dbSession = await mongoose.startSession();
    
    const result = await dbSession.withTransaction(async () => {
      const user = await User.findByIdAndUpdate(
        userId, 
        { kycStatus: 'Rejected' }, 
        { new: true, session: dbSession }
      );
      
      const lease = await Lease.findByIdAndUpdate(
        leaseId, 
        { 
          'signatureAudit.isSigned': false,
          status: 'Pending_Verification' 
        },
        { new: true, session: dbSession }
      ).populate('listingId', 'title');

      if (!lease || !user) throw new Error("RECORD_NOT_FOUND");
      if (!lease.listingId) throw new Error("LISTING_NOT_FOUND");

      return { user, lease };
    });

    await dbSession.endSession();

    if (result === "RECORD_NOT_FOUND") return { success: false, error: "Record not found." };
    if (result === "LISTING_NOT_FOUND") return { success: false, error: "Corrupted lease data." };

    // @ts-ignore
    const propertyTitle = result.lease.listingId.title;

    await sendEmail({
      to: result.user.email,
      subject: `Application Review: ${propertyTitle}`,
      react: React.createElement(ApplicationStatusEmail, { 
        userName: result.user.name, 
        propertyTitle: propertyTitle, 
        isApproved: false 
      })
    });

    revalidatePath("/admin/activations");
    return { success: true, message: "Paperwork rejected. Tenant will be prompted to resubmit." };

  } catch (error: any) {
    console.error(`[SECURITY LOG] Reject Paperwork Failed (Admin: ${session?.userId}):`, error.message);
    return { success: false, error: "An internal error occurred." };
  }
}