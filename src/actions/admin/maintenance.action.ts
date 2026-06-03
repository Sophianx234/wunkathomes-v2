"use server";

import { connectToDatabase } from "@/config/DbConnect";
import Maintenance from "@/models/maintenance";
import { revalidatePath } from "next/cache";

// --- TYPES ---
export type MaintenanceStatus = "Pending" | "In_Progress" | "Resolved" | "Cancelled";

interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function updateMaintenanceStatusAction(
  ticketId: string, 
  newStatus: MaintenanceStatus
): Promise<ActionResponse> {
  try {
    // 1. Validate Input
    if (!ticketId || !newStatus) {
      return { success: false, error: "Missing required fields." };
    }

    const validStatuses: MaintenanceStatus[] = ["Pending", "In_Progress", "Resolved", "Cancelled"];
    if (!validStatuses.includes(newStatus)) {
      return { success: false, error: "Invalid status provided." };
    }

    // 2. Connect to DB
    await connectToDatabase();

    // 3. Perform the Update
    // We update the status and Mongoose will automatically update the `updatedAt` timestamp
    const updatedTicket = await Maintenance.findByIdAndUpdate(
      ticketId,
      { status: newStatus },
      { new: true } // Returns the document after update
    );

    if (!updatedTicket) {
      return { success: false, error: "Maintenance ticket not found." };
    }

    // 4. Revalidate the cache so the dashboard immediately shows the new status
    revalidatePath("/admin/maintenance");

    // 5. Return success
    return { 
      success: true, 
      message: `Ticket status updated to ${newStatus.replace("_", " ")}` 
    };

  } catch (error) {
    console.error("Failed to update maintenance status:", error);
    return { 
      success: false, 
      error: "An unexpected error occurred while updating the ticket." 
    };
  }
}