"use server";

import { getSession } from "@/lib/session";
import { connectToDatabase } from "@/config/DbConnect";
import Maintenance from "@/models/maintenance";
import Lease from "@/models/lease";
import { revalidatePath } from "next/cache";

// Adjust this import path to exactly where you saved your Cloudinary utility file
import { uploadToCloudinary } from "@/lib/cloudinary"; 

export type ActionState = {
  success: boolean;
  message: string;
  error?: string;
};

export async function submitMaintenanceRequest(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    // 1. Secure the Action
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, message: "", error: "Unauthorized. Please log in." };
    }

    await connectToDatabase();

    // 2. Contextualize the Request
    const activeLease = await Lease.findOne({ userId: session.userId, status: "Active" }).lean();
    
    if (!activeLease) {
      return { 
        success: false, 
        message: "", 
        error: "No active lease found. Maintenance requests are only available for current residents." 
      };
    }

    // 3. Extract Form Data
    const category = formData.get("category") as string;
    const priority = formData.get("priority") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!category || !priority || !title || !description) {
      return { success: false, message: "", error: "Please complete all required fields." };
    }

    // 4. Handle Media Uploads (Optimized for Concurrent Upload)
    const rawMediaFiles = formData.getAll("media") as File[];
    
    // Filter out any empty files or accidental empty form submissions
    const validMediaFiles = rawMediaFiles.filter(file => file && file.size > 0);
    
    let imageUrls: string[] = [];
    
    if (validMediaFiles.length > 0) {
      // Pass the entire array to your utility function. 
      // It will automatically trigger the Promise.all array overload.
      const uploadResult = await uploadToCloudinary(validMediaFiles, "wunkathomes/maintenance");
      
      // Ensure the result is formatted as an array for MongoDB
      imageUrls = Array.isArray(uploadResult) ? uploadResult : [uploadResult];
    }

    // 5. Generate a Professional Ticket Number
    const ticketNumber = `MNT-${Math.floor(100000 + Math.random() * 900000)}`;

    // 6. Save to Database
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
      status: "Pending"
    });

    // 7. Refresh the cache
    revalidatePath("/user/dashboard");
    revalidatePath("/user/maintenance/history");
    
    return { 
      success: true, 
      message: `Ticket ${ticketNumber} submitted successfully.` 
    };

  } catch (error: any) {
    console.error("Maintenance Submission Error:", error);
    return { 
      success: false, 
      message: "", 
      error: "A server error occurred while processing your request. Please try again." 
    };
  }
}