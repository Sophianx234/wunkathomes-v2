"use server"

import { connectToDatabase } from "@/config/DbConnect"
import { getSession } from "@/lib/session"
import SavedProperty from "@/models/saved";
import Listing from "@/models/listing"; // Or Property, depending on what you display
import { revalidatePath } from "next/cache"
import { z } from "zod";
import { headers } from "next/headers";

// NOTE: In production, implement Redis-based rate limiting
// import { ratelimit } from "@/lib/redis";

export type SaveActionState = {
  success: boolean;
  message: string;
  error: string;
  isSaved?: boolean;
};

// ============================================================================
// 1. STRICT INPUT VALIDATION SCHEMA (ZOD)
// ============================================================================
const toggleSaveSchema = z.object({
  // Enforce strict MongoDB ObjectID format
  propertyId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Property ID format"),
});

// ============================================================================
// 2. SERVER ACTION
// ============================================================================
export async function toggleSavePropertyAction(rawPropertyId: string): Promise<SaveActionState> {
  let ip = "unknown";
  let userId = "unknown";

  try {
    // 1. Capture Digital Footprint
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for")?.split(',')[0] || "Unknown IP";

    // 2. Zero-Trust Authorization
    const session = await getSession();
    if (!session || !session.userId) {
      throw new Error("UNAUTHORIZED");
    }
    userId = session.userId;

    // 3. Rate Limiting (Prevent API Abuse)
    // const { success } = await ratelimit.limit(`save_prop_${userId}`);
    // if (!success) throw new Error("RATE_LIMIT_EXCEEDED");

    // 4. Strict Payload Scrubbing
    const { propertyId } = toggleSaveSchema.parse({ propertyId: rawPropertyId });

    await connectToDatabase();

    // 5. Contextual Verification (Does the property actually exist?)
    // Note: Adjust to Listing.exists or Property.exists depending on your exact architecture
    const propertyExists = await Listing.exists({ _id: propertyId });
    if (!propertyExists) {
      return { success: false, message: "", error: "Property no longer exists.", isSaved: false };
    }

    // 6. Atomic Operation (Race Condition Prevention)
    // Instead of checking then deleting, we ATTEMPT to delete first. 
    // This is an atomic operation. If it returns a document, it means it was saved, and now it isn't.
    const deletedSave = await SavedProperty.findOneAndDelete({
      user: userId,
      property: propertyId
    });

    if (deletedSave) {
      // It was successfully un-saved
      revalidatePath("/user/saved"); 
      return { 
        success: true, 
        message: "Property removed from saved homes.", 
        error: "", 
        isSaved: false 
      };
    } else {
      // It wasn't found, which means we need to save it.
      // DevSecOps Note: Ensure you have a Unique Compound Index in your MongoDB Schema 
      // on { user: 1, property: 1 } to prevent any simultaneous insert race conditions!
      await SavedProperty.create({
        user: userId,
        property: propertyId
      });
      
      revalidatePath("/user/saved"); 
      return { 
        success: true, 
        message: "Property saved successfully!", 
        error: "", 
        isSaved: true 
      };
    }

  } catch (error: any) {
    // 7. Secure Failure & Contextual Logging
    if (error.message === "UNAUTHORIZED") {
      return { success: false, message: "", error: "You must be logged in to save properties." };
    }
    if (error.message === "RATE_LIMIT_EXCEEDED") {
      return { success: false, message: "", error: "You are clicking too fast. Please slow down." };
    }
    
    // Catch duplicate key errors from MongoDB (Code 11000) if a race condition hits the .create() block
    if (error.code === 11000) {
       return { success: true, message: "Property saved successfully!", error: "", isSaved: true };
    }

    console.error(`[SECURITY LOG] Toggle Save Error (User: ${userId}, IP: ${ip}):`, error.message);
    return { success: false, message: "", error: "An unexpected error occurred." };
  }
}