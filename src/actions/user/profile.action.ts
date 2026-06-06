"use server";

import { revalidatePath } from "next/cache";
// Import your specific DB, Model, Session, and Cloudinary helper paths
import { getSession } from "@/lib/session"; 
import { uploadToCloudinary } from "@/lib/cloudinary"; 
import { connectToDatabase } from "@/config/DbConnect";
import User from "@/models/user";

export async function updateProfileAction(formData: FormData) {
  try {
    // 1. Get the current authenticated user session
    // (Alternatively, extract userId from formData like your KYC example if preferred)
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }
    const userId = session.userId;

    // 2. Extract all data from the FormData object
    const name = formData.get("name") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const countryCode = formData.get("countryCode") as string;
    
    // Extract the image file
    const profilePhotoFile = formData.get("profilePicture") as File | null;

    if (!name || !phoneNumber) {
      return { success: false, error: "Name and phone number are required." };
    }

    // 3. Connect to the database
    await connectToDatabase();

    // Prepare the base payload for the database update
    const updatePayload: any = {
      name,
      phoneNumber,
      countryCode,
    };

    // 4. Upload Profile Photo using your custom helper (if a new file was provided)
    if (profilePhotoFile && profilePhotoFile.size > 0) {
      const profilePhotoUrl = await uploadToCloudinary(
        profilePhotoFile,
        `wunkatehomes/profiles/${userId}`
      );
      
      // Append the new URL to our database payload
      updatePayload.profilePicture = profilePhotoUrl;
    }

    // 5. Update the User Model
    await User.findByIdAndUpdate(userId, updatePayload);

    // 6. Revalidate the settings/dashboard path so the UI instantly shows the new avatar and details
    revalidatePath("/dashboard/settings"); // Adjust to your actual settings route

    return { success: true, message: "Profile updated successfully!" };

  } catch (error) {
    console.error("Profile Update Error:", error);
    return { success: false, error: "An unexpected error occurred during the update." };
  }
}