"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { connectToDatabase } from "@/config/DbConnect";
import User from "@/models/user";
import { z } from "zod";
import { headers } from "next/headers";

// NOTE: In production, implement Redis rate-limiting
// import { ratelimit } from "@/lib/redis";

// ============================================================================
// 1. STRICT INPUT VALIDATION SCHEMAS (ZOD)
// ============================================================================
const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  phoneNumber: z.string().min(8, "Phone number is too short").max(15).regex(/^\d+$/, "Phone must contain only numbers").trim(),
  countryCode: z.string().max(5).trim(),
});

// Security Constraints for Profile Image
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB max for profile pictures
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ============================================================================
// 2. SERVER ACTION
// ============================================================================
export async function updateProfileAction(formData: FormData) {
  let ip = "unknown";
  let userId = "unknown";

  try {
    // 1. Capture Digital Footprint
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for")?.split(',')[0] || "Unknown IP";

    // 2. Strict Zero-Trust Authorization
    const session = await getSession();
    if (!session || !session.userId) {
      throw new Error("UNAUTHORIZED");
    }
    userId = session.userId;

    // 3. Rate Limiting (Prevent API abuse / spamming uploads)
    // const { success } = await ratelimit.limit(`profile_update_${userId}`);
    // if (!success) throw new Error("RATE_LIMIT_EXCEEDED");

    // 4. Strict Input Validation (Prevent Mass Assignment)
    const rawData = {
      name: formData.get("name"),
      phoneNumber: formData.get("phoneNumber"),
      countryCode: formData.get("countryCode"),
    };

    const validatedFields = updateProfileSchema.safeParse(rawData);
    if (!validatedFields.success) {
      return { success: false, error: validatedFields.error.errors[0].message };
    }

    const { name, phoneNumber, countryCode } = validatedFields.data;

    // 5. Secure File Validation Firewall
    const profilePhotoFile = formData.get("profilePicture") as File | null;
    let profilePhotoUrl: string | undefined = undefined;

    if (profilePhotoFile && profilePhotoFile.size > 0) {
      // Defense-in-Depth: Validate MIME type and Size BEFORE sending to Cloudinary
      if (!ALLOWED_MIME_TYPES.includes(profilePhotoFile.type)) {
        return { success: false, error: "Invalid image format. Only JPG, PNG, and WEBP are allowed." };
      }
      if (profilePhotoFile.size > MAX_FILE_SIZE) {
        return { success: false, error: "Profile picture must be less than 2MB." };
      }

      // Safe to upload
      profilePhotoUrl = await uploadToCloudinary(
        profilePhotoFile,
        `wunkathomes/profiles`
      );
    }

    await connectToDatabase();

    // 6. Explicitly Map Payload (Prevent hidden field tampering)
    const updatePayload: any = {
      name,
      phoneNumber,
      countryCode,
    };

    if (profilePhotoUrl) {
      updatePayload.profilePicture = profilePhotoUrl;
    }

    // 7. Update User (IDOR prevention built-in via session.userId constraint)
    const updatedUser = await User.findByIdAndUpdate(userId, updatePayload, { new: true });
    
    if (!updatedUser) {
      return { success: false, error: "User profile could not be found." };
    }

    // 8. Revalidate UI Cache
    revalidatePath("/dashboard/settings"); 
    // If you display the avatar in the global navbar, you might need to revalidate layout:
    // revalidatePath("/", "layout");

    return { success: true, message: "Profile updated successfully!" };

  } catch (error: any) {
    // 9. Fail Securely & Contextual Logging
    if (error.message === "UNAUTHORIZED") return { success: false, error: "Unauthorized. Please log in again." };
    if (error.message === "RATE_LIMIT_EXCEEDED") return { success: false, error: "Too many requests. Please wait a moment." };

    console.error(`[SECURITY LOG] Profile Update Error (User: ${userId}, IP: ${ip}):`, error.message);
    return {
      success: false,
      error: "An unexpected error occurred during the update.",
    };
  }
}