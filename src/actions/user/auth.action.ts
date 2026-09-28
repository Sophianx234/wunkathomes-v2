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

    if (['Admin', 'Manager'].includes(user.role)) {
      // 1. Generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(otpCode, 10);
      
      user.twoFactorToken = hashedOtp;
      user.twoFactorExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
      await user.save();

      // 2. Send Email
      const TwoFactorEmail = (await import('@/components/email/two-factor-mail')).default;
      await sendEmail({
        to: user.email,
        subject: "WunkatHomes Admin Verification Code",
        react: React.createElement(TwoFactorEmail, { userName: user.name, otpCode })
      }).catch(err => console.error("[NON-FATAL] Failed to send 2FA email:", err));

      return { 
        success: true, 
        requiresTwoFactor: true, 
        email: user.email, 
        message: "Please check your email for the verification code." 
      };
    }

    await createSession({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    let targetRoute = "/";
    if (formData.get("isModal") === "true") targetRoute = "REFRESH";

    return { success: true, message: "Welcome back!", redirectUrl: targetRoute };

  } catch (error: any) {
    if (error.message === "RATE_LIMIT_EXCEEDED") return { success: false, error: "Too many login attempts. Please try again later." };
    console.error(`[SECURITY LOG] Login Error (IP: ${ip}):`, error.message);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only numbers"),
});

export async function verifyTwoFactorAction(prevState: any, formData: FormData) {
  try {
    const validatedFields = verifyOtpSchema.safeParse(Object.fromEntries(formData));
    if (!validatedFields.success) return { success: false, error: "Invalid code format." };
    
    const { email, otp } = validatedFields.data;
    await connectToDatabase();
    
    const user = await User.findOne({ 
      email,
      twoFactorExpires: { $gt: Date.now() }
    }).select("+twoFactorToken");

    if (!user || !user.twoFactorToken) {
      return { success: false, error: "Code is invalid or has expired." };
    }

    const isValid = await bcrypt.compare(otp, user.twoFactorToken);
    if (!isValid) {
      return { success: false, error: "Incorrect verification code." };
    }

    // Clear the tokens to prevent reuse
    user.twoFactorToken = undefined;
    user.twoFactorExpires = undefined;
    await user.save();

    await createSession({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    let targetRoute = "/admin/overview";
    if (formData.get("isModal") === "true") targetRoute = "REFRESH";

    return { success: true, message: "Verification successful!", redirectUrl: targetRoute };

  } catch (error: any) {
    console.error("2FA Verify Error:", error);
    return { success: false, error: "An unexpected error occurred." };
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

// ============================================================================
// 6. RESEND 2FA OTP
// ============================================================================
export async function resendTwoFactorAction(email: string) {
  try {
    if (!email) return { success: false, error: "Missing email address." };

    await connectToDatabase();
    const user = await User.findOne({ email });

    if (!user || !['Admin', 'Manager'].includes(user.role)) {
      // Fail silently for security (don't confirm if user exists to unauthorized callers)
      return { success: false, error: "Unable to process request." };
    }

    if (user.accountStatus === "Suspended") {
      return { success: false, error: "This account is suspended." };
    }

    // 1. Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otpCode, 10);
    
    user.twoFactorToken = hashedOtp;
    user.twoFactorExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    // 2. Send Email
    const TwoFactorEmail = (await import('@/components/email/two-factor-mail')).default;
    await sendEmail({
      to: user.email,
      subject: "WunkatHomes Admin Verification Code",
      react: React.createElement(TwoFactorEmail, { userName: user.name, otpCode })
    }).catch(err => console.error("[NON-FATAL] Failed to resend 2FA email:", err));

    return { success: true, message: "A new verification code has been sent to your email." };
  } catch (error) {
    console.error("[AUTH LOG] 2FA Resend Error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
