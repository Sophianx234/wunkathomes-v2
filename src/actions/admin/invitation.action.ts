"use server";

import { connectToDatabase } from "@/config/DbConnect";
import Invitation from "@/models/invitation";
import User from "@/models/user";
import { getSession, createSession } from "@/lib/session";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import InvitationEmail from "@/components/email/invitation-email";
import { sendEmail } from "@/lib/resend";
import React from "react";
import TeamUpdateEmail from "@/components/email/team-update-mail";

// --- 1. INVITE TEAM MEMBER ---
export async function inviteTeamMemberAction(email: string, role: "Admin" | "Manager") {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, error: "A user with this email already exists." };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await Invitation.findOneAndUpdate(
      { email },
      {
        email,
        role,
        invitedBy: session.userId,
        token,
        expiresAt,
      },
      { upsert: true, new: true }
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/accept-invite?token=${token}`;
await sendEmail({
      to: email,
      subject: "Join the WunkatHomes Team",
      react: React.createElement(InvitationEmail, { role, inviteLink })
    });
    
    revalidatePath("/admin/manage/team"); 

    return { success: true, message: `Invitation sent to ${email}` };
  } catch (error: any) {
    return { success: false, error: "An unexpected error occurred while sending the invite." };
  }
}



// --- 3. UPDATE TEAM MEMBER ROLE ---
export async function updateTeamMemberRole(userId: string, newRole: "Admin" | "Manager") {
  try {
    const session = await getSession();
    if (!session || session.role !== "Admin") {
      return { success: false, error: "Only Administrators can change roles." };
    }

    await connectToDatabase();
    
    if (session.userId === userId && newRole !== "Admin") {
      return { success: false, error: "You cannot demote your own account." };
    }

    const user =await User.findByIdAndUpdate(userId, { role: newRole });
    await sendEmail({
      to: user.email,
      subject: "Account Permission Update",
      react: React.createElement(TeamUpdateEmail, {
        userName: user.name,
        title: "Account permissions updated",
        message: `Your account role has been updated to ${newRole}. You may need to log out and log back in for changes to take effect.`
      })
    });
    revalidatePath("/admin/manage/team");
    
    return { success: true, message: `Role updated successfully.` };
  } catch (error) {
    return { success: false, error: "Failed to update role." };
  }
}

// --- 4. TOGGLE ACCOUNT STATUS (Suspend/Restore) ---
export async function toggleTeamAccountStatus(userId: string, currentStatus: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "Admin") {
      return { success: false, error: "Only Administrators can suspend accounts." };
    }

    await connectToDatabase();
    const newStatus = currentStatus === "Active" ? "Suspended" : "Active";
    
    const user = await User.findByIdAndUpdate(userId, { accountStatus: newStatus });

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
  } catch (error) {
    return { success: false, error: "Failed to update account status." };
  }
}

// --- 5. CANCEL PENDING INVITATION ---
export async function cancelInvitation(invitationId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "Admin") {
      return { success: false, error: "Unauthorized." };
    }

    await connectToDatabase();
    
    await Invitation.findByIdAndDelete(invitationId);
    revalidatePath("/admin/manage/team");
    
    return { success: true, message: "Invitation cancelled." };
  } catch (error) {
    return { success: false, error: "Failed to cancel invitation." };
  }
}

export async function acceptInviteAction(prevState: any, formData: FormData) {
  try {
    const token = formData.get("token") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;

    if (!token || !name || !phone || !password) {
      return { success: false, error: "All fields are required." };
    }

    await connectToDatabase();

    // 1. Validate the token and check expiration
    const invitation = await Invitation.findOne({ 
      token, 
      expiresAt: { $gt: new Date() } 
    });

    if (!invitation) {
      return { success: false, error: "This invitation is invalid or has expired." };
    }

    // 2. Ensure the email isn't already taken
    const existingUser = await User.findOne({ email: invitation.email });
    if (existingUser) {
      await Invitation.findByIdAndDelete(invitation._id); // Clean up dead invite
      return { success: false, error: "An account with this email already exists." };
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create the actual user based on the invite parameters
    const newUser = await User.create({
      name,
      email: invitation.email,
      phone,
      password: hashedPassword,
      role: invitation.role, // "Admin" or "Manager"
      accountStatus: "Active",
      kycStatus: "Verified", // Staff don't strictly need KYC, but keeping schema happy
    });

    // 5. Delete the invitation to prevent reuse
    await Invitation.findByIdAndDelete(invitation._id);

    // 6. Log the new team member in immediately
    await createSession({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    return { success: true, message: "Welcome to the team! Redirecting..." };
  } catch (error: any) {
    console.error("Accept invite error:", error);
    return { success: false, error: "An error occurred while creating your account." };
  }
}