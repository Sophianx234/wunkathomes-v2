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
  // Force strict MongoDB ObjectID format
  listingId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Listing ID"),
  rating: z.coerce.number().min(1, "Please select a rating").max(5),
  comment: z.string().trim().max(1000, "Comment is too long").optional(),
  // Force strict URL-safe slug format
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
    // 1. Capture Digital Footprint
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for")?.split(',')[0] || "Unknown IP";

    // 2. Strict Authentication Check (NO Type Casting Bypasses)
    const session = await getSession();
    if (!session || !session.userId) {
      throw new Error("UNAUTHORIZED");
    }
    userId = session.userId;

    // 3. Rate Limiting (Prevent Review Spamming / Botting)
    // const { success } = await ratelimit.limit(`review_${userId}`);
    // if (!success) throw new Error("RATE_LIMIT_EXCEEDED");

    // 4. Strict Payload Scrubbing
    const validatedFields = reviewSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
      return {
        success: false,
        message: "",
        error: "Please provide a valid rating and check your comment length.",
      };
    }

    const { listingId, rating, comment, slug } = validatedFields.data;

    await connectToDatabase();

    // 5. Contextual Verification (Does the listing actually exist?)
    const listingExists = await Listing.exists({ _id: listingId, slug: slug });
    if (!listingExists) {
      return { success: false, message: "", error: "Property not found." };
    }

    // Optional DevSecOps Advice: If only tenants should review, check the Lease model here
    // const hasRented = await Lease.exists({ userId, listingId });
    // if (!hasRented) throw new Error("UNAUTHORIZED_REVIEW");

    // 6. Atomic Upsert (Race Condition Prevention)
    // By using findOneAndUpdate with upsert, the database engine guarantees that 
    // concurrent requests will not create duplicates, even if they hit at the exact same millisecond.
    const review = await Review.findOneAndUpdate(
      { 
        listingId: listingId, 
        userId: userId 
      },
      {
        // If it exists, we don't change anything. If it's new, we set these fields.
        $setOnInsert: {
          listingId: listingId,
          userId: userId,
          rating: rating,
          comment: comment || undefined,
        }
      },
      { upsert: true, new: false } // new: false returns the document BEFORE the upsert
    );

    // If 'review' is populated, it means a document ALREADY existed before this operation.
    if (review) {
      return {
        success: false,
        message: "",
        error: "You have already submitted a review for this property.",
      };
    }

    // 7. Exact Cache Revalidation
    revalidatePath(`/properties/${slug}`);

    return { success: true, message: "Thank you for your feedback!" };

  } catch (error: any) {
    // 8. Secure Failure & Logging
    if (error.message === "UNAUTHORIZED") {
      return { success: false, message: "", error: "You must be logged in to leave a review." };
    }
    if (error.message === "RATE_LIMIT_EXCEEDED") {
      return { success: false, message: "", error: "You are submitting reviews too quickly." };
    }

    console.error(`[SECURITY LOG] Review Submission Error (User: ${userId}, IP: ${ip}):`, error.message);
    
    return { 
      success: false, 
      message: "", 
      error: "Something went wrong. Please try again." 
    };
  }
}