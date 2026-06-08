"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectToDatabase } from "@/config/DbConnect";
import Review from "@/models/review";
import { getSession, SessionPayload } from "@/lib/session";

const reviewSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  rating: z.coerce.number().min(1, "Please select a rating").max(5),
  comment: z.string().trim().max(1000, "Comment is too long").optional(),
  slug: z.string().min(1, "Slug is required"),
});

export type ReviewActionState = {
  success: boolean;
  message: string;
  error?: string;
};

export async function submitReviewAction(
  prevState: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  try {
    const session = await getSession() as SessionPayload 

    // --- Data Extraction ---
    const rawData = {
      listingId: formData.get("listingId"),
      rating: formData.get("rating"),
      comment: formData.get("comment"),
      slug: formData.get("slug"),
    };

    const validationResult = reviewSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        message: "",
        error: "Please select a star rating before submitting.",
      };
    }

    const { listingId, rating, comment, slug } = validationResult.data;

    // --- Save to Database ---
    await connectToDatabase();

    const isReviewed = await Review.findOne({
      listingId: new mongoose.Types.ObjectId(listingId),
      userId: new mongoose.Types.ObjectId(session.userId),
    });

    if (isReviewed) {
      return {
        success: false,
        message: "",
        error: "You have already submitted a review for this property.",
      };
    }

    await Review.create({
      listingId: new mongoose.Types.ObjectId(listingId),
      userId: new mongoose.Types.ObjectId(session.userId),
      rating,
      comment: comment || undefined,
    });

    // --- Exact Cache Revalidation ---
    // This targets your exact page layout and instantly shows the review to the user
    revalidatePath(`/properties/${slug}`);

    return { success: true, message: "Thank you for your feedback!" };
  } catch (error) {
    console.error("Review submission error:", error);
    return { success: false, message: "", error: "Something went wrong. Please try again." };
  }
}