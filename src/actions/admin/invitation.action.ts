"use server";

import { connectToDatabase } from "@/config/DbConnect";
import Invitation from "@/models/invitation";
import User from "@/models/user";
import { getSession, createSession, SessionPayload } from "@/lib/session";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import mongoose from "mongoose";
import React from "react";
import { sendEmail } from "@/lib/resend";
import InvitationEmail from "@/components/email/invitation-email";
import TeamUpdateEmail from "@/components/email/team-update-mail";

// NOTE: In a real environment, import your actual Redis rate limiter instance here
// import { ratelimit } from "@/lib/redis";

// ============================================================================
// 1. STRICT INPUT VALIDATION SCHEMAS (ZOD)
// ============================================================================

const inviteSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  role: z.enum(["Admin", "Manager"], { message: "Invalid role specified" }),
});

const updateRoleSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID format"),
  newRole: z.enum(["Admin", "Manager"]),
});

const toggleStatusSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID format"),
  currentStatus: z.enum(["Active", "Suspended"]),
});

const cancelInviteSchema = z.object({
  invitationId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Invite ID format"),
});

const acceptInviteSchema = z.object({
  token: z.string().min(32, "Invalid token length").trim(),
  name: z.string().min(2, "Name is too short").trim().max(100),
  phone: z.string().min(10, "Invalid phone number").trim().max(15),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ============================================================================
// 2. SERVER ACTIONS
// ============================================================================

// --- INVITE TEAM MEMBER ---
export async function inviteTeamMemberAction(rawEmail: string, rawRole: string) {
  let session;
  try {
    session = await getSession() as SessionPayload;
    // 1. RBAC Check
    if (!session?.userId || session.role !== "Admin") {
      throw new Error("Unauthorized access attempt.");
    }

    // 2. Rate Limiting (Mocked - Limit to 10 invites per hour per Admin)
    // const { success } = await ratelimit.limit(`invite_${session.userId}`);
    // if (!success) throw new Error("Rate limit exceeded.");

    // 3. Strict Input Validation
    const { email, role } = inviteSchema.parse({ email: rawEmail, role: rawRole });

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, error: "A user with this email already exists." };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Upsert invitation securely
    await Invitation.findOneAndUpdate(
      { email },
      { email, role, invitedBy: session.userId, token, expiresAt },
      { upsert: true, new: true }
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await sendEmail({
      to: email,
      subject: "Join the WunkatHomes Team",
      react: React.createElement(InvitationEmail, { role, inviteLink: `${baseUrl}/accept-invite?token=${token}` })
    });
    
    revalidatePath("/admin/manage/team"); 
    return { success: true, message: `Invitation sent to ${email}` };
  } catch (error: any) {
    console.error(`[SECURITY LOG] Invite Action Failed (Admin: ${session?.userId}):`, error.message);
    return { success: false, error: "Operation failed. Please try again." }; // Fail securely
  }
}

// --- UPDATE TEAM MEMBER ROLE ---
export async function updateTeamMemberRole(rawUserId: string, rawNewRole: string) {
  let session;
  try {
    session = await getSession() as SessionPayload;
    if (!session?.userId || session.role !== "Admin") throw new Error("Unauthorized");

    const { userId, newRole } = updateRoleSchema.parse({ userId: rawUserId, newRole: rawNewRole });

    // IDOR Prevention: Admin cannot demote themselves
    if (session.userId === userId && newRole !== "Admin") {
      return { success: false, error: "You cannot demote your own account." };
    }

    await connectToDatabase();
    
    // Resource Verification: Ensure target exists
    const user = await User.findById(userId);
    if (!user) return { success: false, error: "User not found." };

    user.role = newRole;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Account Permission Update",
      react: React.createElement(TeamUpdateEmail, {
        userName: user.name,
        title: "Account permissions updated",
        message: `Your account role has been updated to ${newRole}.`
      })
    });
    
    revalidatePath("/admin/manage/team");
    return { success: true, message: `Role updated successfully.` };
  } catch (error: any) {
    console.error(`[SECURITY LOG] Role Update Failed:`, error.message);
    return { success: false, error: "Failed to update role." };
  }
}

// --- TOGGLE ACCOUNT STATUS ---
export async function toggleTeamAccountStatus(rawUserId: string, rawCurrentStatus: string) {
  let session;
  try {
    session = await getSession() as SessionPayload;
    if (!session?.userId || session.role !== "Admin") throw new Error("Unauthorized");

    const { userId, currentStatus } = toggleStatusSchema.parse({ userId: rawUserId, currentStatus: rawCurrentStatus });
    
    // IDOR Prevention: Admin cannot suspend themselves
    if (session.userId === userId) {
      return { success: false, error: "You cannot suspend your own account." };
    }

    await connectToDatabase();
    
    const user = await User.findById(userId);
    if (!user) return { success: false, error: "User not found." };

    const newStatus = currentStatus === "Active" ? "Suspended" : "Active";
    user.accountStatus = newStatus;
    await user.save();

    const isSuspended = newStatus === "Suspended";
    await sendEmail({
      to: user.email,
      subject: isSuspended ? "Account Suspended" : "Account Reactivated",
      react: React.createElement(TeamUpdateEmail, {
        userName: user.name,
        title: isSuspended ? "Account Access Restricted" : "Account Access Restored",
        message: isSuspended
          ? "Your WunkatHomes account has been suspended. Please contact administration for further details."
          : "Your WunkatHomes account has been reactivated. You may now log in normally."
      })
    });
    
    revalidatePath("/admin/manage/team");
    return { success: true, message: `Account has been ${newStatus.toLowerCase()}.` };
  } catch (error: any) {
    console.error(`[SECURITY LOG] Status Toggle Failed:`, error.message);
    return { success: false, error: "Failed to update account status." };
  }
}

// --- CANCEL PENDING INVITATION ---
export async function cancelInvitation(rawInvitationId: string) {
  let session;
  try {
    session = await getSession() as SessionPayload;
    if (!session?.userId || session.role !== "Admin") throw new Error("Unauthorized");

    const { invitationId } = cancelInviteSchema.parse({ invitationId: rawInvitationId });

    await connectToDatabase();
    await Invitation.findByIdAndDelete(invitationId);
    
    revalidatePath("/admin/manage/team");
    return { success: true, message: "Invitation cancelled." };
  } catch (error: any) {
    console.error(`[SECURITY LOG] Invite Cancel Failed:`, error.message);
    return { success: false, error: "Failed to cancel invitation." };
  }
}

// --- ACCEPT INVITE (MULTI-DOCUMENT TRANSACTION) ---
export async function acceptInviteAction(prevState: any, formData: FormData) {
  try {
    // 1. IP-Based Rate Limiting (Unauthenticated route protection)
    // const ip = await headers().get("x-forwarded-for") || "unknown";
    // const { success } = await ratelimit.limit(`accept_invite_${ip}`);
    // if (!success) throw new Error("Rate limit exceeded.");

    // 2. Strict Input Validation (Prevent mass assignment by using Object.fromEntries)
    const data = acceptInviteSchema.parse(Object.fromEntries(formData));

    await connectToDatabase();

    // 3. Database Integrity: Start Mongoose Transaction
    const dbSession = await mongoose.startSession();
    
    // session.withTransaction automatically handles commit/abort based on success/errors thrown
    const result = await dbSession.withTransaction(async () => {
      
      const invitation = await Invitation.findOne({ 
        token: data.token, 
        expiresAt: { $gt: new Date() } 
      }).session(dbSession);

      if (!invitation) throw new Error("INVALID_TOKEN");

      const existingUser = await User.findOne({ email: invitation.email }).session(dbSession);
      if (existingUser) {
        await Invitation.findByIdAndDelete(invitation._id).session(dbSession);
        throw new Error("USER_EXISTS");
      }

      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create user inside transaction
      const newUser = await User.create([{
        name: data.name,
        email: invitation.email,
        phone: data.phone,
        password: hashedPassword,
        role: invitation.role,
        accountStatus: "Active",
        kycStatus: "Verified",
      }], { session: dbSession });

      // Delete invite inside transaction
      await Invitation.findByIdAndDelete(invitation._id).session(dbSession);

      // Establish auth session immediately
      await createSession({
        userId: newUser[0]._id.toString(),
        email: newUser[0].email,
        role: newUser[0].role,
      });

      return "SUCCESS";
    });

    await dbSession.endSession();

    if (result === "USER_EXISTS") return { success: false, error: "An account with this email already exists." };
    if (result === "INVALID_TOKEN") return { success: false, error: "This invitation is invalid or has expired." };

    return { success: true, message: "Welcome to the team! Redirecting..." };

  } catch (error: any) {
    // 5. Fail Securely & Logging
    console.error(`[SECURITY LOG] Accept Invite Failed:`, error.message);
    return { success: false, error: "An error occurred while creating your account. Please try again." };
  }
}
