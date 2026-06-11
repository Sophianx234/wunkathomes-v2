"use server";

import { z } from "zod";
import { connectToDatabase } from "@/config/DbConnect";
import Tour from "@/models/tour";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { getSession } from "@/lib/session";

// NOTE: In production, implement Redis rate-limiting (IP-based for create, User-based for update)
// import { ratelimit } from "@/lib/redis";

export type TourActionState = {
  success: boolean;
  message: string;
  error?: string;
};

// ============================================================================
// 1. STRICT INPUT VALIDATION SCHEMAS (ZOD)
// ============================================================================
const tourSchema = z.object({
  // Enforce strict 24-character hex to prevent ObjectId crashes
  listingId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Property ID format"),
  phoneNumber: z.string().min(9).max(15).regex(/^\+?[\d\s-]+$/, "Invalid phone format").trim(),
  // Ensure date and time strings follow exact formats
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
});

const updateTourSchema = z.object({
  tourId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Tour ID format"),
  // Only accept explicitly defined application statuses
  status: z.enum(['Pending_Time', 'Confirmed', 'Completed', 'No_Show', 'Converted']).optional(),
  // Prevent massive string injections
  notes: z.string().max(2000, "Notes cannot exceed 2000 characters").trim().optional(),
});

// ============================================================================
// 2. SERVER ACTIONS
// ============================================================================

export async function createTourAction(
  prevState: TourActionState, 
  formData: FormData
): Promise<TourActionState> {
  let ip = "unknown";
  
  try {
    // 1. Capture Identity Footprint
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for")?.split(',')[0] || "Unknown IP";

    // 2. IP-Based Rate Limiting (Prevent booking spam from unauthenticated users)
    // const { success } = await ratelimit.limit(`create_tour_${ip}`);
    // if (!success) throw new Error("RATE_LIMIT_EXCEEDED");

    // 3. Strict Payload Scrubbing (Prevent Mass Assignment)
    const rawData = {
      listingId: formData.get("listingId"),
      phoneNumber: formData.get("phoneNumber"),
      scheduledDate: formData.get("scheduledDate"),
      scheduledTime: formData.get("scheduledTime"),
    };

    const validation = tourSchema.safeParse(rawData);
    
    if (!validation.success) {
      return { success: false, message: "", error: validation.error.errors[0].message };
    }

    const { listingId, phoneNumber, scheduledDate, scheduledTime } = validation.data;

    // 4. Safe Date Parsing
    const combinedDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
    if (isNaN(combinedDateTime.getTime())) {
      return { success: false, message: "", error: "Invalid date or time provided." };
    }

    const now = new Date();
    if (combinedDateTime < now) {
      return { success: false, message: "", error: "Cannot schedule a tour in the past." };
    }

    const cookieStore = await cookies();
    
    // 5. Layer 1: Browser/Cookie Double-Booking Check
    if (cookieStore.has(`tour_booked_${listingId}`)) {
      return { success: false, message: "", error: "You already have a tour scheduled on this device." };
    }

    await connectToDatabase();

    // 6. Layer 2: Database Double-Booking Check
    const existingTour = await Tour.exists({
      listingId: listingId, // Zod guarantees this is a valid 24-char hex
      phoneNumber: phoneNumber,
      scheduledDate: { $gt: now }, 
      status: { $nin: ['Completed', 'No_Show'] }
    });

    if (existingTour) {
      return { success: false, message: "", error: "This phone number already has a pending tour for this property." };
    }

    // 7. Execute Creation
    await Tour.create({
      listingId: listingId,
      phoneNumber,
      scheduledDate: combinedDateTime,
      status: 'Pending_Time'
    });

    // 8. Dynamic Cookie Expiration
    const expireTime = new Date(combinedDateTime.getTime() + (2 * 60 * 60 * 1000));
    cookieStore.set(`tour_booked_${listingId}`, combinedDateTime.toISOString(), {
      expires: expireTime, 
      path: "/",
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return { success: true, message: "Tour scheduled successfully!" };

  } catch (error: any) {
    if (error.message === "RATE_LIMIT_EXCEEDED") return { success: false, message: "", error: "You are booking too many tours. Please wait." };
    
    console.error(`[SECURITY LOG] Tour Booking Error (IP: ${ip}):`, error.message);
    return { success: false, message: "", error: "Failed to schedule tour. Please try again." };
  }
}

export async function updateTourAction(rawTourId: string, data: { status?: string; notes?: string }) {
  let session;
  
  try {
    // 1. Zero-Trust Authorization (CRITICAL FIX)
    session = await getSession();
    if (!session?.userId || !['Admin', 'Manager'].includes(session.role)) {
      throw new Error("UNAUTHORIZED");
    }

    // 2. Strict Payload Validation
    const { tourId, status, notes } = updateTourSchema.parse({
      tourId: rawTourId,
      status: data.status,
      notes: data.notes
    });

    await connectToDatabase();
    
    // 3. Explicit Data Mapping (Prevent mass assignment)
    const updatePayload: any = {};
    if (status) updatePayload.status = status;
    if (notes !== undefined) updatePayload.notes = notes;

    // 4. Perform Update
    const updatedTour = await Tour.findByIdAndUpdate(
      tourId, 
      { $set: updatePayload },
      { new: true }
    );

    if (!updatedTour) {
      return { success: false, error: "Tour record not found." };
    }

    // Adjust cache path based on your exact app structure
    revalidatePath("/admin/manage/tours");
    
    return { success: true, message: "Tour updated successfully!" };

  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return { success: false, error: "Unauthorized access attempt." };
    
    console.error(`[SECURITY LOG] Tour Update Error (Admin: ${session?.userId || 'Unknown'}):`, error.message);
    return { success: false, error: "Failed to update tour." };
  }
}