"use server";

import { connectToDatabase } from "@/config/DbConnect";
import { getSession } from "@/lib/session";
import Maintenance from "@/models/maintenance";
import User from "@/models/user"; // Required for Mongoose to populate properly
import { sendEmail } from "@/lib/resend";
import MaintenanceUpdateEmail from "@/components/email/maintenance-update-mail";
import { revalidatePath } from "next/cache";
import React from "react";
import { z } from "zod";

// NOTE: In a real environment, import your Redis rate limiter instance here
// import { ratelimit } from "@/lib/redis";

// ============================================================================
// 1. STRICT INPUT VALIDATION SCHEMA (ZOD)
// ============================================================================
const updateMaintenanceSchema = z.object({
  ticketId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Ticket ID format"),
  newStatus: z.enum(["Pending", "In_Progress", "Resolved", "Cancelled"]),
});

export type MaintenanceStatus = z.infer<typeof updateMaintenanceSchema>["newStatus"];

interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// ============================================================================
// 2. SERVER ACTION
// ============================================================================
export async function updateMaintenanceStatusAction(
  rawTicketId: string, 
  rawNewStatus: string
): Promise<ActionResponse> {
  let session;
  try {
    // 1. RBAC Verification (Zero-Trust)
    session = await getSession();
    if (!session?.userId || !["Admin", "Manager"].includes(session.role)) {
      throw new Error("Unauthorized access attempt.");
    }


    // 3. Strict Input Validation
    const { ticketId, newStatus } = updateMaintenanceSchema.parse({
      ticketId: rawTicketId,
      newStatus: rawNewStatus,
    });

    await connectToDatabase();

    // 4. Perform Update & Populate Relations
    // CRITICAL FIX: We MUST populate the userId field so we can access .email and .name safely
    const updatedTicket = await Maintenance.findByIdAndUpdate(
      ticketId,
      { status: newStatus },
      { new: true } 
    ).populate({
      path: "userId",
      model: User,
      select: "name email"
    });

    if (!updatedTicket) {
      return { success: false, error: "Maintenance ticket not found." };
    }

    // 5. Safely Dispatch Email
    // Defense-in-depth: Ensure the populated user actually has an email before attempting to send
    if (updatedTicket.userId && updatedTicket.userId.email) {
      await sendEmail({
        to: updatedTicket.userId.email,
        subject: `Status Update: Maintenance Request #${updatedTicket.ticketNumber.slice(-8)}`,
        react: React.createElement(MaintenanceUpdateEmail, {
          userName: updatedTicket.userId.name,
          ticketNumber: updatedTicket.ticketNumber,
          ticketTitle: updatedTicket.title,
          newStatus: newStatus
        })
      });
    }

    // 6. Revalidate Cache
    revalidatePath("/admin/maintenance");

    return { 
      success: true, 
      message: `Ticket status updated to ${newStatus.replace("_", " ")}` 
    };

  } catch (error: any) {
    // 7. Fail Securely & Log with Context
    console.error(`[SECURITY LOG] Maintenance Status Update Failed (Admin: ${session?.userId || 'Unknown'}):`, error.message);
    
    // Never leak Zod validation paths or DB stack traces to the client
    return { 
      success: false, 
      error: "Operation failed. Please try again." 
    };
  }
}
