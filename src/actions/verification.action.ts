"use server"

import { revalidatePath } from "next/cache"
import { v2 as cloudinary } from 'cloudinary'
import { uploadToCloudinary } from "@/lib/cloudinary" // Your provided helper
import { connectToDatabase } from "@/config/DbConnect"
import User from "@/models/user"
import Lease from "@/models/lease"

export async function submitIdentityVerification(formData: FormData) {
  try {
    // 1. Extract all data from the FormData object
    const userId = formData.get("userId") as string;
    const leaseId = formData.get("leaseId") as string;
    const fullName = formData.get("fullName") as string;
    const dob = formData.get("dob") as string;
    const idType = formData.get("idType") as string;
    const idNumber = formData.get("idNumber") as string;
    
    // Extract the image files/data
    const profilePhotoFile = formData.get("profilePhoto") as File;
    const verificationPhotoBase64 = formData.get("verificationPhotoBase64") as string;

    if (!userId || !leaseId || !profilePhotoFile || !verificationPhotoBase64) {
      return { success: false, error: "Missing required verification data or images." };
    }

    // 2. Connect to the database
    // await dbConnect();
    await connectToDatabase();

    // 3. Upload Profile Photo using your custom helper
    const profilePhotoUrl = await uploadToCloudinary(
      profilePhotoFile, 
      `wunkathomes/profiles/${userId}`
    );

    // 4. Upload the Base64 Selfie Photo directly via Cloudinary SDK
    // Cloudinary automatically detects and parses base64 data URIs
    const selfieUploadResult = await cloudinary.uploader.upload(verificationPhotoBase64, {
      folder: `wunkathomes/kyc/${userId}`,
      resource_type: "image"
    });
    const verificationPhotoUrl = selfieUploadResult.secure_url;

    // 5. Update the User Model
    await User.findByIdAndUpdate(userId, {
      legalName: fullName,
      dateOfBirth: new Date(dob),
      idDocumentType: idType,
      idDocumentNumber: idNumber,
      profilePicture: profilePhotoUrl, // Updated from the dropzone
      idVerificationPhotoUrl: verificationPhotoUrl, // The selfie
      kycStatus: "Pending"
    });

    // 6. Update the Lease Status
    await Lease.findByIdAndUpdate(leaseId, {
      status: "Awaiting_Admin_Approval"
    });

    // 7. Revalidate the dashboard so the UI instantly updates to the "Reviewing" state
    revalidatePath("/dashboard/leases");

    return { success: true, message: "Verification submitted successfully." };

  } catch (error) {
    console.error("KYC Submission Error:", error);
    return { success: false, error: "An unexpected error occurred during submission." };
  }
}