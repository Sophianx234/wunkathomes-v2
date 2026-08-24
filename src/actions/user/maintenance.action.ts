"use server";

import { getSession } from "@/lib/session";
import { connectToDatabase } from "@/config/DbConnect";
import Maintenance from "@/models/maintenance";
import Lease from "@/models/lease";
import { revalidatePath } from "next/cache";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { z } from "zod";
import crypto from "crypto";
import { headers } from "next/headers";

// NOTE: In a production environment, implement Redis-based rate limiting
// import { ratelimit } from "@/lib/redis";

export type ActionState = {
  success: boolean;
  message: string;
  error?: string;
};

// ============================================================================
// 1. STRICT INPUT VALIDATION SCHEMAS (ZOD)
// ============================================================================
const maintenanceSchema = z.object({
  category: z.string().min(2).max(50).trim(),
  priority: z.enum(["Low", "Medium", "High", "Emergency"], {
    message: "Invalid priority level",
  }),
  title: z
    .string()
    .min(5, "Title is too short")
    .max(100, "Title is too long")
    .trim(),
  description: z
    .string()
    .min(10, "Please provide more details")
    .max(2000, "Description is too long")
    .trim(),
});

// Security Constraints for File Uploads
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_FILE_COUNT = 3; // Max 3 images per request
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ============================================================================
// 2. SERVER ACTION
// ============================================================================
export async function submitMaintenanceRequest(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let session;
  let ip = "unknown";

  try {
    // 1. Capture Identity & Digital Footprint
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for")?.split(",")[0] || "Unknown IP";

    session = await getSession();
    if (!session?.userId) {
      throw new Error("UNAUTHORIZED");
    }

    // 2. Rate Limiting (Crucial for endpoints handling heavy file uploads)
    // const { success } = await ratelimit.limit(`maintenance_${session.userId}`);
    // if (!success) throw new Error("RATE_LIMIT_EXCEEDED");

    // 3. Strict Zod Validation (Prevent Mass Assignment via Object.fromEntries)
    const validatedFields = maintenanceSchema.safeParse(
      Object.fromEntries(formData),
    );
    if (!validatedFields.success) {
      return {
        success: false,
        message: "",
        error: validatedFields.error.issues[0].message,
      };
    }

    const { category, priority, title, description } = validatedFields.data;

    await connectToDatabase();

    // 4. Contextual Authorization (IDOR Prevention)
    const activeLease = await Lease.findOne({
      userId: session.userId,
      status: "Active",
    }).lean();
    if (!activeLease) {
      return {
        success: false,
        message: "",
        error:
          "No active lease found. Maintenance requests are only available for current residents.",
      };
    }
    
    // 4.5. Anti-Spam & Abuse Prevention
    // Check how many open tickets the user currently has
    const openTicketCount = await Maintenance.countDocuments({
      userId: session.userId,
      status: { $in: ["Pending", "In_Progress"] }
    });
    
    if (openTicketCount >= 3) {
       return {
        success: false,
        message: "",
        error: "You have reached the maximum of 3 open maintenance tickets. Please wait for them to be resolved before submitting new ones."
       }
    }

    // 5. Secure Media Validation (Defense-in-Depth)
    const rawMediaFiles = formData.getAll("media") as File[];
    const validMediaFiles: File[] = [];

    for (const file of rawMediaFiles) {
      if (!file || file.size === 0) continue; // Skip empty nodes

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return {
          success: false,
          message: "",
          error: "Invalid file format. Only JPG, PNG, and WEBP are allowed.",
        };
      }
      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          message: "",
          error: `File ${file.name} exceeds the 5MB limit.`,
        };
      }
      validMediaFiles.push(file);
    }

    if (validMediaFiles.length > MAX_FILE_COUNT) {
      return {
        success: false,
        message: "",
        error: `You can only upload a maximum of ${MAX_FILE_COUNT} images.`,
      };
    }

    // 6. External API Upload (Cloudinary)
    let imageUrls: string[] = [];
    if (validMediaFiles.length > 0) {
      const uploadResult = await uploadToCloudinary(
        validMediaFiles,
        "wunkathomes/maintenance",
      );
      imageUrls = Array.isArray(uploadResult) ? uploadResult : [uploadResult];
    }

    // 7. Cryptographically Secure Ticket Generation
    const secureHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const ticketNumber = `MNT-${Date.now().toString().slice(-4)}-${secureHex}`;

    // 8. Save to Database
    await Maintenance.create({
      userId: session.userId,
      leaseId: activeLease._id,
      listingId: activeLease.listingId,
      ticketNumber,
      category,
      priority,
      title,
      description,
      images: imageUrls,
      status: "Pending",
    });

    // 9. Cache Invalidation
    revalidatePath("/user/dashboard");
    revalidatePath("/user/maintenance/history");

    return {
      success: true,
      message: `Ticket ${ticketNumber} submitted successfully.`,
    };
  } catch (error: any) {
    // 10. Fail Securely & Contextual Logging
    if (error.message === "UNAUTHORIZED")
      return { success: false, message: "", error: "Unauthorized access." };
    if (error.message === "RATE_LIMIT_EXCEEDED")
      return {
        success: false,
        message: "",
        error: "You are submitting tickets too quickly. Please wait.",
      };

    console.error(
      `[SECURITY LOG] Maintenance Submission Error (User: ${session?.userId}, IP: ${ip}):`,
      error.message,
    );

    return {
      success: false,
      message: "",
      error:
        "A server error occurred while processing your request. Please try again.",
    };
  }
}
