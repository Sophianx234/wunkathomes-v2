"use server";

import { getSession } from "@/lib/session";
import { connectToDatabase } from "@/config/DbConnect";
import User from "@/models/user";
import { revalidatePath } from "next/cache";

export async function toggleAccountStatus(userId: string, currentStatus: string) {
  try {
    const session = await getSession();
    // Enforce strict admin access
    if (!session || !['Admin', 'Manager'].includes(session.role)) {
      return { success: false, error: "Unauthorized access." };
    }

    await connectToDatabase();

    const newStatus = currentStatus === "Active" ? "Suspended" : "Active";

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { accountStatus: newStatus },
      { new: true }
    );

    if (!updatedUser) {
      return { success: false, error: "Tenant not found." };
    }

    // Instantly refresh the admin table data
    revalidatePath("/admin/tenants");

    return { success: true, message: `Account successfully ${newStatus.toLowerCase()}.` };
  } catch (error) {
    console.error("Failed to toggle account status:", error);
    return { success: false, error: "An internal error occurred." };
  }
}