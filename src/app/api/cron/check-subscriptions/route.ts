import { NextResponse } from "next/server";
import { connectToDatabase } from "@/config/DbConnect";
import Lease from "@/models/lease";
import SmartLock from "@/models/smartlock";
import AccessLog from "@/models/accesslog";
import { sendEmail } from "@/lib/resend";
import React from "react";
import SubscriptionReminderEmail from "@/components/email/subscription-reminder-mail";
import { deleteTemporaryPin } from "@/lib/tuya";
// Import your email template (adjust path as needed)

export const dynamic = "force-dynamic"; // Ensure Next.js doesn't statically cache this route

export async function GET(request: Request) {
  try {
    // 1. Zero-Trust Authorization: Ensure ONLY your cron service can trigger this
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn("[SECURITY] Unauthorized cron execution attempt.");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();
    const now = new Date();

    let totalProcessed = 0;

    // ============================================================================
    // HELPER FUNCTION: Process specific milestones to keep code DRY
    // ============================================================================
    async function processMilestone(
      milestoneKey: "milestone1" | "milestone2" | "milestone3" | "expired",
      emailSubjectPrefix: string
    ) {
      // Find all active leases where this milestone's date has passed and the email hasn't been sent
      const query: any = { status: "Active" };
      query[`reminders.${milestoneKey}.triggerDate`] = { $lte: now };
      query[`reminders.${milestoneKey}.sent`] = false;

      // Only fetch exactly what we need to save memory
      const leases = await Lease.find(query)
        .populate("userId", "email name")
        .populate("listingId", "title propertyId");

      for (const lease of leases) {
        if (!lease.userId?.email) continue;

        // Calculate exact days remaining for the email copy
        const daysLeft = Math.max(0, Math.ceil((lease.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const subject = daysLeft === 0 
          ? `Action Required: Your lease for ${lease.listingId.title} has expired`
          : `${emailSubjectPrefix}: ${daysLeft} days left on your lease`;

        try {
          // Fire the email
          await sendEmail({
            to: lease.userId.email,
            subject: subject,
            react: React.createElement(SubscriptionReminderEmail, {
              userName: lease.userId.name,
              propertyTitle: lease.listingId.title,
              daysRemaining: daysLeft,
              endDate: lease.endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
            })
          });

          // Mark as sent (Idempotency)
          lease.reminders[milestoneKey].sent = true;
          
          // If expired, automatically update the lease status & physically revoke access
          if (milestoneKey === "expired") {
            lease.status = "Expired";
            
            try {
              const lock = await SmartLock.findOne({
                $or: [{ propertyId: lease.listingId.propertyId }, { listingId: lease.listingId._id }],
              });

              if (lock && lock.tuyaDeviceId) {
                // Wipe any active temporary PINs from the physical Tuya lock
                if (lock.activeTempPins && lock.activeTempPins.length > 0) {
                  for (const pin of lock.activeTempPins) {
                    try {
                      await deleteTemporaryPin(lock.tuyaDeviceId, pin.pinId);
                    } catch (tuyaError) {
                      console.error(`[CRON WARNING] Failed to delete PIN ${pin.pinId} from Tuya:`, tuyaError);
                    }
                  }
                }
                
                // Clear the PINs in the DB
                lock.activeTempPins = [];
                await lock.save();

                // Non-repudiable audit log for system intervention
                await AccessLog.create({
                  lockId: lock._id,
                  propertyId: lock.propertyId,
                  action: 'SYSTEM_LOCKOUT',
                  actorId: lease.userId._id,
                  actorType: 'System',
                  performedBy: 'System Cron',
                  metadata: { reason: "Lease Expired", autoRevokedPins: true }
                });
              }
            } catch (lockError) {
              console.error(`[CRON ERROR] Smart Lock Revocation Failed for Lease ${lease._id}:`, lockError);
            }
          }

          await lease.save();
          totalProcessed++;

        } catch (emailError) {
          console.error(`[NON-FATAL] Failed to send ${milestoneKey} email to ${lease.userId.email}:`, emailError);
          // We do NOT set sent: true here, so the cron will try again tomorrow
        }
      }
    }

    // ============================================================================
    // EXECUTE THE MILESTONES
    // ============================================================================
    // You can adjust these prefixes to match your brand tone
    await processMilestone("milestone1", "Mid-Lease Check-in");     // 50%
    await processMilestone("milestone2", "Upcoming Lease Expiry");  // 75%
    await processMilestone("milestone3", "Urgent: Lease Renewals"); // 90%
    await processMilestone("expired", "Lease Expired");             // 100%

    return NextResponse.json({ 
      success: true, 
      message: `Cron executed successfully. Processed ${totalProcessed} reminders.` 
    });

  } catch (error: any) {
    console.error("[CRON FATAL ERROR]:", error.message);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
