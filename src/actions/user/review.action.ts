"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { connectToDatabase } from "@/config/DbConnect";
import Review from "@/models/review";
import Listing from "@/models/listing";
import { getSession } from "@/lib/session";

// NOTE: In production, implement Redis rate-limiting to prevent review spam
// import { ratelimit } from "@/lib/redis";

export type ReviewActionState = {
  success: boolean;
  message: string;
  error?: string;
};

// ============================================================================
// 1. STRICT INPUT VALIDATION SCHEMA (ZOD)
// ============================================================================
const reviewSchema = z.object({
  propertyId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Property ID"),
  rating: z.coerce.number().min(1, "Please select a rating").max(5),
  comment: z.string().trim().max(1000, "Comment is too long").optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Invalid slug format"),
});

// ============================================================================
// 2. SERVER ACTION
// ============================================================================
export async function submitReviewAction(
  prevState: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  let ip = "unknown";
  let userId = "unknown";

  try {
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for")?.split(',')[0] || "Unknown IP";

    // 1. Authentication Check
    const session = await getSession();
    if (!session || !session.userId) {
      throw new Error("UNAUTHORIZED");
    }
    userId = session.userId;

    const validatedFields = reviewSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
      return {
        success: false,
        message: "",
        error: "Please provide a valid rating and check your comment length.",
      };
    }

    const { propertyId, rating, comment, slug } = validatedFields.data;

    await connectToDatabase();

    const listingExists = await Listing.exists({ _id: propertyId, slug: slug });
    if (!listingExists) {
      return { success: false, message: "", error: "Property not found." };
    }

    // 2. Occupancy Verification Check
    const Lease = (await import("@/models/lease")).default;
    const hasOccupied = await Lease.exists({
      userId: userId,
      listingId: propertyId, 
      status: { $in: ["Active", "Expired"] } // Verified past or present occupancy
    });

    if (!hasOccupied) {
      return {
        success: false,
        message: "",
        error: "You can only review properties you have occupied.",
      };
    }

    // 3. Duplicate Check
    const existingReview = await Review.exists({ userId, propertyId });
    if (existingReview) {
      return {
        success: false,
        message: "",
        error: "You have already reviewed this property.",
      };
    }

    // 4. Save Review
    await Review.create({
      propertyId,
      userId,
      rating,
      comment: comment || undefined,
    });

    revalidatePath(`/properties/${slug}`);

    return { success: true, message: "Thank you for your feedback!" };

  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return { success: false, message: "", error: "You must be logged in to leave a review." };
    }

    console.error(`[SECURITY LOG] Review Submission Error (User: ${userId}, IP: ${ip}):`, error.message);
    
    return { 
      success: false, 
      message: "", 
      error: "Something went wrong. Please try again." 
    };
  }
}
