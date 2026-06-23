"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { connectToDatabase } from "@/config/DbConnect";
import User from "@/models/user";
import { getSession } from "@/lib/session";
import { headers } from "next/headers";

// NOTE: In production, implement Redis rate-limiting to prevent upload spam
// import { ratelimit } from "@/lib/redis";

export type ActionState = {
  success: boolean;
  message: string;
  error?: string;
};

// ============================================================================
// 1. STRICT INPUT VALIDATION SCHEMAS (ZOD)
// ============================================================================
// Max Base64 length for a 5MB image is roughly 7,000,000 characters.
const MAX_BASE64_LENGTH = 7000000;

const kycSchema = z
  .object({
    fullName: z.string().min(2, "Full name is too short").max(100).trim(),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    // Explicitly defining acceptable ID types
    idType: z.enum(["Ghana_Card", "Passport", "Driver_License", "Voter_ID"]),
    idNumber: z.string().min(4, "ID Number is too short").max(50).trim(),

    existingProfileUrl: z.string().url("Invalid URL").optional().nullable(),

    profilePhotoBase64: z
      .string()
      .max(MAX_BASE64_LENGTH, "Profile photo exceeds 5MB limit.")
      .refine(
        (val) => !val || val.startsWith("data:image/"),
        "Invalid image format.",
      )
      .optional()
      .nullable(),

    verificationPhotoBase64: z
      .string()
      .max(MAX_BASE64_LENGTH, "Verification photo exceeds 5MB limit.")
      .startsWith("data:image/", "Invalid image format."),
  })
  .refine((data) => data.profilePhotoBase64 || data.existingProfileUrl, {
    message: "Profile photo is required.",
    path: ["profilePhotoBase64"],
  });

// ============================================================================
// 2. SERVER ACTION
// ============================================================================
export async function submitIdentityVerification(
  formData: FormData,
): Promise<ActionState> {
  let ip = "unknown";
  let userId = "unknown";

  try {
    // 1. Capture Identity & Digital Footprint
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for")?.split(",")[0] || "Unknown IP";

    // 2. Strict Authentication Check (NO Type Casting)
    const session = await getSession();
    if (!session || !session.userId) {
      throw new Error("UNAUTHORIZED");
    }
    userId = session.userId;

    // 3. Rate Limiting (Crucial for heavy Base64 payload endpoints)
    // const { success } = await ratelimit.limit(`kyc_upload_${userId}`);
    // if (!success) throw new Error("RATE_LIMIT_EXCEEDED");

    // 4. Strict Payload Scrubbing
    const rawData = {
      fullName: formData.get("fullName"),
      dob: formData.get("dob"),
      idType: formData.get("idType"),
      idNumber: formData.get("idNumber"),
      profilePhotoBase64: formData.get("profilePhotoBase64"),
      existingProfileUrl: formData.get("existingProfileUrl"),
      verificationPhotoBase64: formData.get("verificationPhotoBase64"),
    };

    const validationResult = kycSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        message: "",
        error: validationResult.error.issues[0].message,
      };
    }

    const {
      fullName,
      dob,
      idType,
      idNumber,
      profilePhotoBase64,
      existingProfileUrl,
      verificationPhotoBase64,
    } = validationResult.data;

    // 5. Secure External API Execution (Cloudinary)
    let profilePhotoUrl = existingProfileUrl;

    // Because Zod guarantees the length and prefix, we are safe to upload
    if (profilePhotoBase64) {
      profilePhotoUrl = await uploadToCloudinary(
        profilePhotoBase64,
        "wunkathomes/profiles",
      );
    }

    const verificationPhotoUrl = await uploadToCloudinary(
      verificationPhotoBase64,
      "wunkathomes/kyc",
    );

    await connectToDatabase();

    // 6. Update User Profile (IDOR inherently prevented by session.userId context)
    await User.findByIdAndUpdate(userId, {
      legalName: fullName,
      dateOfBirth: new Date(dob),
      idDocumentType: idType,
      idDocumentNumber: idNumber,
      profilePicture: profilePhotoUrl,
      idVerificationPhotoUrl: verificationPhotoUrl,
      kycStatus: "Pending",
    });

    revalidatePath("/overview/leases");
    return { success: true, message: "Verification submitted successfully." };
  } catch (error: any) {
    // 7. Secure Failure & Contextual Logging
    if (error.message === "UNAUTHORIZED")
      return {
        success: false,
        message: "",
        error: "Unauthorized. Please log in.",
      };
    if (error.message === "RATE_LIMIT_EXCEEDED")
      return {
        success: false,
        message: "",
        error: "Upload rate limit exceeded. Please wait.",
      };

    console.error(
      `[SECURITY LOG] KYC Submission Error (User: ${userId}, IP: ${ip}):`,
      error.message,
    );
    return {
      success: false,
      message: "",
      error: "An unexpected error occurred during submission.",
    };
  }
}
