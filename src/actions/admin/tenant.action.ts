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
