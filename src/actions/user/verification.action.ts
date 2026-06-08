"use server"

import { revalidatePath } from "next/cache"
import { uploadToCloudinary } from "@/lib/cloudinary" 
import { connectToDatabase } from "@/config/DbConnect"
import User from "@/models/user"
import Lease from "@/models/lease"
import { getSession, SessionPayload } from "@/lib/session"

export async function submitIdentityVerification(formData: FormData) {
  try {
    const session = await getSession() as SessionPayload;
    if(!session.userId) return { success: false, error: "Unauthorized. Please log in." };
    
    const userId = session.userId;
    
    // Notice: leaseId is completely removed from here
    const fullName = formData.get("fullName") as string;
    const dob = formData.get("dob") as string;
    const idType = formData.get("idType") as string;
    const idNumber = formData.get("idNumber") as string;
    
    const profilePhotoBase64 = formData.get("profilePhotoBase64") as string | null;
    const existingProfileUrl = formData.get("existingProfileUrl") as string | null;
    const verificationPhotoBase64 = formData.get("verificationPhotoBase64") as string;

    // Strict validation without needing a leaseId
    if (!userId || (!profilePhotoBase64 && !existingProfileUrl) || !verificationPhotoBase64) {
      return { success: false, error: "Missing required verification data or images." };
    }

    await connectToDatabase();

    let profilePhotoUrl = existingProfileUrl;

    if (profilePhotoBase64) {
      profilePhotoUrl = await uploadToCloudinary(profilePhotoBase64, "wunkathomes/profiles");
    }

    const verificationPhotoUrl = await uploadToCloudinary(verificationPhotoBase64, "wunkathomes/kyc");

    // 1. Update the User's Global Identity Profile
    await User.findByIdAndUpdate(userId, {
      legalName: fullName,
      dateOfBirth: new Date(dob),
      idDocumentType: idType,
      idDocumentNumber: idNumber,
      profilePicture: profilePhotoUrl, 
      idVerificationPhotoUrl: verificationPhotoUrl, 
      kycStatus: "Pending"
    });

    // 2. Automatically advance any leases waiting on this verification
    // This looks for leases owned by the user that are stuck at the KYC step
    await Lease.updateMany(
      { 
        userId: userId, 
        status: "Pending_Verification" 
      },
      { 
        $set: { status: "Awaiting_Admin_Approval" } 
      }
    );

    revalidatePath("/dashboard/leases");
    return { success: true, message: "Verification submitted successfully." };

  } catch (error) {
    console.error("KYC Submission Error:", error);
    return { success: false, error: "An unexpected error occurred during submission." };
  }
}