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
    const now = new Date();

    if (combinedDateTime < now) {
      return { success: false, message: "", error: "Cannot schedule a tour in the past." };
    }

    await connectToDatabase();

    // ==========================================
    // LAYER 1: DATABASE DOUBLE-BOOKING CHECK
    // ==========================================
    // Check if this phone number already has a future tour for this specific property
    const existingTour = await Tour.findOne({
      listingId: new mongoose.Types.ObjectId(listingId),
      phoneNumber: phoneNumber,
      scheduledDate: { $gt: now }, // Look for tours that haven't happened yet
      status: { $nin: ['Completed', 'No_Show'] } // Ignore past completed/missed tours
    }).lean();

    if (existingTour) {
      return { 
        success: false, 
        message: "", 
        error: "This phone number already has a pending tour for this property." 
      };
    }

    const cookieStore = await cookies();
    
    // ==========================================
    // LAYER 2: BROWSER/COOKIE DOUBLE-BOOKING CHECK
    // ==========================================
    if (cookieStore.has(`tour_booked_${listingId}`)) {
      return { 
        success: false, 
        message: "", 
        error: "You already have a tour scheduled on this device." 
      };
    }

    // All checks passed, create the tour
    await Tour.create({
      listingId: new mongoose.Types.ObjectId(listingId),
      phoneNumber,
      scheduledDate: combinedDateTime,
      status: 'Pending_Time'
    });

    // ==========================================
    // DYNAMIC COOKIE EXPIRATION
    // ==========================================
    // We want the cookie to expire 2 hours AFTER the scheduled tour time
    const expireTime = new Date(combinedDateTime.getTime() + (2 * 60 * 60 * 1000));
    
    cookieStore.set(`tour_booked_${listingId}`, combinedDateTime.toISOString(), {
      expires: expireTime, // <-- Using explicit expiration date instead of maxAge
      path: "/",
      httpOnly: true, 
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