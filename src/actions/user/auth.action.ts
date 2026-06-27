"use server";

import { connectToDatabase } from "@/config/DbConnect";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/resend";
import React from "react";
import WelcomeEmail from "@/components/email/welcome-mail";
import PasswordResetEmail from "@/components/email/password-reset-mail";
import PasswordChangedEmail from "@/components/email/password-changed-mail";
import { headers } from "next/headers";

// NOTE: In a production environment, you MUST implement Redis-based rate limiting
// import { ratelimit } from "@/lib/redis";

// ============================================================================
// 1. STRICT INPUT VALIDATION SCHEMAS (ZOD)
// ============================================================================

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim().max(100),
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  countryCode: z.string().trim().max(5),
  phoneNumber: z.string().min(7, "Phone number must be at least 7 digits").regex(/^\d+$/, "Phone must contain only numbers").trim().max(15),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required").max(100),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(100),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(64, "Invalid security token").trim(), // Hex string of 32 bytes is 64 chars
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


// ============================================================================
// 2. SERVER ACTIONS
// ============================================================================

export async function signupAction(prevState: any, formData: FormData) {
  let ip = "unknown";
  
  try {
    // 1. Capture Identity Footprint safely
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for") || "unknown";

    // const { success } = await ratelimit.limit(`signup_${ip}`);
    // if (!success) throw new Error("RATE_LIMIT_EXCEEDED");

    const validatedFields = signupSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
      return { success: false, error: validatedFields.error.issues[0].message };
    }

    const { name, email, countryCode, phoneNumber, password } = validatedFields.data;
    const fullPhone = countryCode + phoneNumber;

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, error: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email,
      phone: fullPhone,
      password: hashedPassword,
      role: "User",
      accountStatus: "Active",
      kycStatus: "Unverified",
    });

    await createSession({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    sendEmail({
      to: email,
      subject: "Welcome to WunkatHomes",
      react: React.createElement(WelcomeEmail, { userName: name, exploreUrl: `${process.env.NEXT_PUBLIC_APP_URL}/explore` }),
    }).catch(err => console.error("[NON-FATAL] Failed to send welcome email:", err));

    return { success: true, message: "Account created successfully!" };
  } catch (error: any) {
    if (error.message === "RATE_LIMIT_EXCEEDED") return { success: false, error: "Too many requests. Please try again later." };
    console.error(`[SECURITY LOG] Signup Error (IP: ${ip}):`, error.message);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function loginAction(prevState: any, formData: FormData) {
  let ip = "unknown";
  
  try {
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for") || "unknown";

    // const { success } = await ratelimit.limit(`login_${ip}`);
    // if (!success) throw new Error("RATE_LIMIT_EXCEEDED");

    const validatedFields = loginSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
      return { success: false, error: "Please enter a valid email and password." };
    }

    const { email, password } = validatedFields.data;

    await connectToDatabase();

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return { success: false, error: "Invalid email or password." };
    }

    if (user.accountStatus === "Suspended") {
      return { success: false, error: "This account has been suspended. Please contact support." };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, error: "Invalid email or password." };
    }

    await createSession({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    let targetRoute = "/";
    if (user.role === "Admin") targetRoute = "/admin/overview";
    else if (user.role === "Manager") targetRoute = "/admin/overview";
    else if (formData.get("isModal") === "true") targetRoute = "REFRESH";

    return { success: true, message: "Welcome back!", redirectUrl: targetRoute };

  } catch (error: any) {
    if (error.message === "RATE_LIMIT_EXCEEDED") return { success: false, error: "Too many login attempts. Please try again later." };
    console.error(`[SECURITY LOG] Login Error (IP: ${ip}):`, error.message);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect("/");
}

export async function changePasswordAction(prevState: any, formData: FormData) {
  let userId = "unknown";
  
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: "Unauthorized. Please log in again." };
    userId = session.userId; // Save securely for logs

    // const { success } = await ratelimit.limit(`change_pw_${userId}`);

    const validatedFields = passwordSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
      return { success: false, error: validatedFields.error.issues[0]?.message || "Invalid form data." };
    }

    const { currentPassword, newPassword } = validatedFields.data;

    await connectToDatabase();
    const user = await User.findById(userId).select("+password");
    
    if (!user) return { success: false, error: "User not found." };

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) return { success: false, error: "Incorrect current password." };

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    sendEmail({
      to: user.email,
      subject: "Security Alert: Your password was changed",
      react: React.createElement(PasswordChangedEmail, { userName: user.name })
    }).catch(console.error);

    return { success: true, message: "Password updated successfully!" };

  } catch (error: any) {
    console.error(`[SECURITY LOG] Change Password Error (User: ${userId}):`, error.message);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

export async function forgotPasswordAction(prevState: any, formData: FormData) {
  let ip = "unknown";
  
  try {
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for") || "unknown";

    const validatedFields = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
    if (!validatedFields.success) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const { email } = validatedFields.data;

    await connectToDatabase();
    const user = await User.findOne({ email });

    if (!user) {
      return { success: true, message: "If an account exists, a reset link has been sent." };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your WunkatHomes password",
      react: React.createElement(PasswordResetEmail, { userName: user.name, resetUrl: resetUrl })
    });

    return { success: true, message: "If an account exists, a reset link has been sent." };

  } catch (error: any) {
    console.error(`[SECURITY LOG] Forgot Password Error (IP: ${ip}):`, error.message);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function resetPasswordAction(prevState: any, formData: FormData) {
  let ip = "unknown";
  
  try {
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for") || "unknown";

    const validatedFields = resetPasswordSchema.safeParse(Object.fromEntries(formData));
    if (!validatedFields.success) {
      return { success: false, error: validatedFields.error.issues[0]?.message || "Invalid input." };
    }

    const { token, password } = validatedFields.data;

    await connectToDatabase();

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return { success: false, error: "Token is invalid or has expired." };
    }

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    sendEmail({
      to: user.email,
      subject: "Security Alert: Password Changed",
      react: React.createElement(PasswordChangedEmail, { userName: user.name })
    }).catch(console.error);

    return { 
      success: true, 
      message: "Password reset successfully! You can now log in.",
      redirectUrl: "/login"
    };

  } catch (error: any) {
    console.error(`[SECURITY LOG] Reset Password Error (IP: ${ip}):`, error.message);
    return { success: false, error: "An unexpected error occurred." };
  }
}
