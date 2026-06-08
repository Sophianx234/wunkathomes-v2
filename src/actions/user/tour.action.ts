"use server";

import { z } from "zod";
import { connectToDatabase } from "@/config/DbConnect";
import Tour from "@/models/tour";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export type TourActionState = {
  success: boolean;
  message: string;
  error?: string;
};

// 1. Add scheduledTime to the schema
const tourSchema = z.object({
  listingId: z.string().min(1, "Property ID is missing."),
  phoneNumber: z.string().min(9, "Please enter a valid phone number."),
  scheduledDate: z.string().min(1, "Please select a viewing date."),
  scheduledTime: z.string().min(1, "Please select a viewing time."),
});

export async function createTourAction(
  prevState: TourActionState, 
  formData: FormData
): Promise<TourActionState> {
  try {
    const rawData = {
      listingId: formData.get("listingId"),
      phoneNumber: formData.get("phoneNumber"),
      scheduledDate: formData.get("scheduledDate"),
      scheduledTime: formData.get("scheduledTime"),
    };

    const validation = tourSchema.safeParse(rawData);
    
    if (!validation.success) {
      return { 
        success: false, 
        message: "", 
        error: validation.error.errors[0].message 
      };
    }

    const { listingId, phoneNumber, scheduledDate, scheduledTime } = validation.data;

    // Combine the separate Date and Time strings into one valid ISO string
    const combinedDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);

    await connectToDatabase();

    await Tour.create({
      listingId: new mongoose.Types.ObjectId(listingId),
      phoneNumber,
      scheduledDate: combinedDateTime,
      status: 'Pending_Time'
    });

    // ==========================================
    // SET THE COOKIE TO TRACK THE GUEST BOOKING
    // ==========================================
    cookies().set(`tour_booked_${listingId}`, combinedDateTime.toISOString(), {
      maxAge: 60 * 60 * 24 * 7, // Expires in 7 days
      path: "/",
      httpOnly: true, // Prevents client-side JS from tampering with it
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return { success: true, message: "Tour scheduled successfully!" };
  } catch (error) {
    console.error("Tour booking error:", error);
    return { success: false, message: "", error: "Failed to schedule tour. Please try again." };
  }
}

export async function updateTourAction(tourId: string, data: { status?: string; notes?: string }) {
  try {
    await connectToDatabase();
    
    await Tour.findByIdAndUpdate(tourId, {
      $set: {
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes })
      }
    });

    revalidatePath("/admin/tours");
    return { success: true, message: "Tour updated successfully!" };
  } catch (error) {
    console.error("Failed to update tour:", error);
    return { success: false, error: "Failed to update lead." };
  }
}