"use server";

import { connectToDatabase } from "@/config/DbConnect";
import Inquiry from "@/models/inquiry";
import { revalidatePath } from "next/cache";

export async function getInquiries() {
  try {
    await connectToDatabase();
    const inquiries = await Inquiry.find().sort({ createdAt: -1 }).lean();
    
    // Inquiries might only have string userId, but if it's an ObjectId we can try looking it up.
    // If user relation isn't properly defined in schema as ObjectId, we can manually look it up.
    // However, it's better to populate if possible, or just pass the data and let the client handle avatar fallback.
    let userMap = new Map();
    try {
      const User = (await import("@/models/user")).default;
      const validUserIds = inquiries
        .map((i: any) => i.userId)
        .filter((id: any) => id && id.length === 24); // simplistic ObjectId validation
      if (validUserIds.length > 0) {
        const users = await User.find({ _id: { $in: validUserIds } }).select("profilePicture").lean();
        userMap = new Map(users.map((u: any) => [u._id.toString(), u.profilePicture]));
      }
    } catch (e) {
      console.warn("Failed to enrich inquiries with user profiles:", e);
    }

    const enrichedInquiries = inquiries.map((inq: any) => ({
      ...inq,
      profilePicture: inq.userId ? userMap.get(inq.userId.toString()) : null,
    }));
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(enrichedInquiries)),
    };
  } catch (error: any) {
    console.error("GET INQUIRIES ERROR:", error);
    return { success: false, message: "Failed to fetch inquiries." };
  }
}

export async function updateInquiryStatus(id: string, newStatus: string) {
  try {
    await connectToDatabase();
    
    const updated = await Inquiry.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    ).lean();

    if (!updated) {
      return { success: false, message: "Inquiry not found." };
    }

    revalidatePath("/admin/manage/inquiries");

    return {
      success: true,
      message: "Status updated successfully.",
      data: JSON.parse(JSON.stringify(updated)),
    };
  } catch (error: any) {
    console.error("UPDATE INQUIRY STATUS ERROR:", error);
    return { success: false, message: "Failed to update inquiry status." };
  }
}

export async function deleteInquiry(id: string) {
  try {
    await connectToDatabase();
    
    const deleted = await Inquiry.findByIdAndDelete(id);

    if (!deleted) {
      return { success: false, message: "Inquiry not found." };
    }

    revalidatePath("/admin/manage/inquiries");

    return {
      success: true,
      message: "Inquiry deleted successfully.",
    };
  } catch (error: any) {
    console.error("DELETE INQUIRY ERROR:", error);
    return { success: false, message: "Failed to delete inquiry." };
  }
}
