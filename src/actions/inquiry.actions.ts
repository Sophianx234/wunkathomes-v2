"use server";

import { connectToDatabase } from "@/config/DbConnect";
import Inquiry from "@/models/inquiry";
import { revalidatePath } from "next/cache";

export async function getInquiries() {
  try {
    await connectToDatabase();
    const inquiries = await Inquiry.find().sort({ createdAt: -1 }).lean();
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(inquiries)),
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
