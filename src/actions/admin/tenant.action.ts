"use server";

import { getSession } from "@/lib/session";
import { connectToDatabase } from "@/config/DbConnect";
import User from "@/models/user";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/resend";
import TeamUpdateEmail from "@/components/email/team-update-mail";
import React from "react";
import { z } from "zod";

// ============================================================================
// 1. STRICT INPUT VALIDATION SCHEMA (ZOD)
// ============================================================================
const toggleStatusSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID format"),
  currentStatus: z.enum(["Active", "Suspended"]),
});

// ============================================================================
// 2. SERVER ACTION
// ============================================================================
export async function toggleAccountStatus(rawUserId: string, rawCurrentStatus: string) {
  let session;
  try {
    session = await getSession();
    
    // 1. Base RBAC Check
    if (!session?.userId || !['Admin', 'Manager'].includes(session.role)) {
      throw new Error("Unauthorized access attempt.");
    }

    // 2. Input Scrubbing
    const { userId, currentStatus } = toggleStatusSchema.parse({
      userId: rawUserId,
      currentStatus: rawCurrentStatus,
    });

    // 3. Prevent Self-Lockout
    if (session.userId === userId) {
      return { success: false, error: "You cannot suspend your own account." };
    }

    await connectToDatabase();

    // 4. Fetch the target user FIRST to check their role
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return { success: false, error: "Tenant not found." };
    }

    // 5. PRIVILEGE ESCALATION PREVENTION
    // Managers can ONLY suspend standard 'User' accounts (Tenants).
    if (session.role === "Manager" && targetUser.role !== "User") {
      throw new Error("Privilege Escalation Attempt: Manager tried to modify a higher or equal tier account.");
    }

    // 6. Perform the update
    const newStatus = currentStatus === "Active" ? "Suspended" : "Active";
    targetUser.accountStatus = newStatus;
    await targetUser.save();

    const isSuspended = newStatus === "Suspended";
      
    // 7. Dispatch Email Safely
    if (targetUser.email) {
      await sendEmail({
        to: targetUser.email,
        subject: `Account Access Update: ${newStatus}`,
        react: React.createElement(TeamUpdateEmail, {
          userName: targetUser.name,
          title: isSuspended ? "Account Access Restricted" : "Account Access Restored",
          message: isSuspended 
            ? "Your account access has been restricted. Please contact property management for further information regarding your account status."
            : "Your account access has been restored. You may now log in to the portal normally."
        })
      });
    }

    // 8. Revalidate cache
    revalidatePath("/admin/tenants");

    return { success: true, message: `Account successfully ${newStatus.toLowerCase()}.` };

  } catch (error: any) {
    // 9. Fail securely
    console.error(`[SECURITY LOG] Toggle Account Status Failed (Actor: ${session?.userId || 'Unknown'}):`, error.message);
    // Check if it's our specific escalation error so we can give a clean UI message
    if (error.message.includes("Privilege Escalation")) {
       return { success: false, error: "You do not have permission to modify this staff account." };
    }

    return { success: false, error: "An internal error occurred." };
  }
}

// ============================================================================
// 3. ONBOARDING (OFFLINE KYC -> SMART LOCK PIN)
// ============================================================================
export async function verifyAndOnboardTenantAction(formData: FormData) {
  let session;
  try {
    session = await getSession();
    if (!session?.userId || !['Admin', 'Manager'].includes(session.role)) {
      throw new Error("Unauthorized access attempt.");
    }

    const rawLeaseId = formData.get("leaseId") as string;
    const rawUserId = formData.get("userId") as string;
    const rawGhanaCardNumber = formData.get("ghanaCardNumber") as string;
    const facePhotoFile = formData.get("facePhoto") as File | null;
    const cardScanFile = formData.get("cardScan") as File | null;
    const removeFacePhoto = formData.get("removeFacePhoto") === "true";
    const removeCardScan = formData.get("removeCardScan") === "true";

    if (!rawLeaseId || !rawUserId || !rawGhanaCardNumber || typeof rawGhanaCardNumber !== 'string') {
      throw new Error("Missing required fields or invalid Ghana Card Number.");
    }

    // Process files if present
    const { uploadToCloudinary } = await import("@/lib/cloudinary");
    let facePhotoUrl = undefined;
    let cardScanUrl = undefined;

    if (facePhotoFile && facePhotoFile.size > 0) {
      facePhotoUrl = await uploadToCloudinary(facePhotoFile, `wunkathomes/kyc/faces`);
    }

    if (cardScanFile && cardScanFile.size > 0) {
      cardScanUrl = await uploadToCloudinary(cardScanFile, `wunkathomes/kyc/cards`);
    }

    await connectToDatabase();
    const Lease = (await import("@/models/lease")).default;
    const Listing = (await import("@/models/listing")).default;
    const SmartLock = (await import("@/models/smartlock")).default;

    const updatePayload: any = {
      kycStatus: 'Verified',
      idDocumentNumber: rawGhanaCardNumber.trim()
    };
    if (facePhotoUrl) updatePayload.idVerificationPhotoUrl = facePhotoUrl;
    if (cardScanUrl) updatePayload.idDocumentUrl = cardScanUrl;

    // 1. Mark User as Verified and Save the ID Number & Docs
    const user = await User.findByIdAndUpdate(
      rawUserId, 
      updatePayload, 
      { new: true }
    );
    if (!user) throw new Error("User not found.");

    // 2. Fetch Lease and Property
    const lease = await Lease.findById(rawLeaseId).populate("listingId");
    if (!lease || !lease.listingId) throw new Error("Lease or Listing not found.");

    // 3. Activate Lease
    lease.status = "Active";
    await lease.save();
    await Listing.findByIdAndUpdate(lease.listingId._id, { status: "Rented" });

    // 4. Tuya Smart Lock Provisioning
    let pinStr = "";
    const lock = await SmartLock.findOne({
      $or: [{ propertyId: lease.listingId.propertyId }, { listingId: lease.listingId._id }],
    });

    if (lock && lock.tuyaDeviceId) {
      const { resetTenantPinAction } = await import("./smartlock.action");
      const res = await resetTenantPinAction(lock.tuyaDeviceId, rawLeaseId);
      if (res.success && res.pin) {
        pinStr = res.pin;
      }
    }

    // 5. Send Email
    if (user.email) {
      const LeaseActivationEmail = (await import("@/components/email/lease-activation-mail")).default;
      await sendEmail({
        to: user.email,
        subject: `Lease Active & Access Granted: ${lease.listingId.title}`,
        react: React.createElement(LeaseActivationEmail, { 
          pin: pinStr || "N/A (No Smart Lock Assigned)", 
          propertyTitle: lease.listingId.title 
        })
      }).catch(err => console.error("Failed to send activation email", err));
    }

    revalidatePath("/admin/manage/tenants");
    return { success: true, message: "Tenant successfully verified, lease activated, and access credentials dispatched." };

  } catch (error: any) {
    console.error(`[SECURITY LOG] Onboarding Failed (Actor: ${session?.userId || 'Unknown'}):`, error.message);
    return { success: false, error: error.message || "An internal error occurred." };
  }
}

export async function updateTenantDetailsAction(formData: FormData) {
  try {
    const { getSession } = await import("@/lib/session");
    const session = await getSession();
    if (!session?.userId || !['Admin', 'Manager'].includes(session.role)) {
      return { success: false, error: "Unauthorized access attempt." };
    }

    const userId = formData.get("userId") as string;
    const phone = formData.get("phone") as string;
    const ghanaCardNumber = formData.get("ghanaCardNumber") as string;
    const facePhotoFile = formData.get("facePhoto") as File | null;
    const cardScanFile = formData.get("cardScan") as File | null;

    if (!userId) return { success: false, error: "User ID is required." };

    const { connectToDatabase } = await import("@/config/DbConnect");
    await connectToDatabase();
    
    const User = (await import("@/models/user")).default;
    const user = await User.findById(userId);
    if (!user) return { success: false, error: "User not found." };

    if (phone) user.phone = phone.trim();
    if (ghanaCardNumber) user.ghanaCardNumber = ghanaCardNumber.trim();

    const { uploadToCloudinary } = await import("@/lib/cloudinary");

    if (removeFacePhoto) {
      user.securityPhotoUrl = "";
    } else if (facePhotoFile && facePhotoFile.size > 0) {
      const facePhotoUrl = await uploadToCloudinary(facePhotoFile, "wunkathomes/kyc/faces");
      user.securityPhotoUrl = facePhotoUrl;
    }

    if (removeCardScan) {
      user.ghanaCardUrl = "";
    } else if (cardScanFile && cardScanFile.size > 0) {
      const cardScanUrl = await uploadToCloudinary(cardScanFile, "wunkathomes/kyc/cards");
      user.ghanaCardUrl = cardScanUrl;
    }

    await user.save();
    
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/tenants");
    revalidatePath("/admin/manage/tenants");

    return { success: true, message: "Tenant details successfully updated." };
  } catch (error: any) {
    console.error("[UPDATE_TENANT_DETAILS]", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}
