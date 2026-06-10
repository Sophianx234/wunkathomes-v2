"use server";

import { getSession } from "@/lib/session";
import { connectToDatabase } from "@/config/DbConnect";
import User from "@/models/user";
import Lease from "@/models/lease";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/resend";
import React from "react";
import ApplicationStatusEmail from "@/components/email/application-status-mail";
import LeaseActivationEmail from "@/components/email/lease-activation-mail";

export async function approveTenantPaperwork(leaseId: string, userId: string) {
  try {
    const session = await getSession();
    if (!session || !['Admin', 'Manager'].includes(session.role)) {
      return { success: false, error: "Unauthorized access." };
    }

    await connectToDatabase();

    // 1. Verify User KYC
    const user = await User.findByIdAndUpdate(userId, { kycStatus: 'Verified' });
    
    // 2. Mark Lease as Signed and update status
   const lease = await Lease.findByIdAndUpdate(leaseId, { 
      'signatureAudit.isSigned': true,
      status: 'Awaiting_Admin_Approval' // Moving it to the final step
    });

    await sendEmail({
    to: user.email,
    subject: `Application Approved: ${lease.listingId.title}`,
    react: React.createElement(ApplicationStatusEmail, { userName: user.name, propertyTitle: lease.listingId.title, isApproved: true })
  });

    revalidatePath("/admin/activations");
    return { success: true, message: "Legal paperwork approved successfully." };
  } catch (error) {
    console.error("Failed to approve paperwork:", error);
    return { success: false, error: "An internal error occurred." };
  }
}

export async function activateLeaseAndGeneratePin(leaseId: string) {
  try {
    const session = await getSession();
    if (!session || !['Admin', 'Manager'].includes(session.role)) {
      return { success: false, error: "Unauthorized access." };
    }

    await connectToDatabase();

    // Generate a secure 6-digit Smart Lock PIN
    const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();

    // Update lease to Active and inject the PIN
    const updatedLease = await Lease.findByIdAndUpdate(leaseId, {
      status: 'Active',
      smartLockPin: generatedPin
    }, { new: true }).select('+smartLockPin');

    if (!updatedLease) {
      return { success: false, error: "Lease not found." };
    }

    await sendEmail({
    to: updatedLease.userId.email,
    subject: `Lease Active: ${updatedLease.listingId.title}`,
    react: React.createElement(LeaseActivationEmail, { pin: generatedPin, propertyTitle: updatedLease.listingId.title })
  });

    revalidatePath("/admin/activations");
    return { success: true, pin: generatedPin, message: "PIN synced and lease activated." };
  } catch (error) {
    console.error("Failed to generate PIN:", error);
    return { success: false, error: "An internal error occurred." };
  }
}

export async function rejectTenantPaperwork(leaseId: string, userId: string) {
  try {
    const session = await getSession();
    if (!session || !['Admin', 'Manager'].includes(session.role)) {
      return { success: false, error: "Unauthorized access." };
    }

    await connectToDatabase();

    // 1. Mark User KYC as Rejected
    await User.findByIdAndUpdate(userId, { kycStatus: 'Rejected' });
    
    // 2. Reset Lease signature status to force a resubmission
    await Lease.findByIdAndUpdate(leaseId, { 
      'signatureAudit.isSigned': false,
      status: 'Pending_Verification' // Push them back to the verification stage
    });

    revalidatePath("/admin/activations");
    return { success: true, message: "Paperwork rejected. Tenant will be prompted to resubmit." };
  } catch (error) {
    console.error("Failed to reject paperwork:", error);
    return { success: false, error: "An internal error occurred." };
  }
}