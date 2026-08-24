import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/config/DbConnect";
import Transaction from "@/models/transaction";
import Lease from "@/models/lease";
import Listing from "@/models/listing";
import User from "@/models/user";
import mongoose from "mongoose";
import { sendEmail } from "@/lib/resend";
import React from "react";
import PaymentReceiptEmail from "@/components/email/payment-reciept-mail";
import RenewalConfirmationEmail from "@/components/email/renewal-confirmation-mail";

export const dynamic = "force-dynamic";

function calculateMilestones(start: Date, end: Date) {
  const totalDurationMs = end.getTime() - start.getTime();
  return {
    milestone1: { triggerDate: new Date(start.getTime() + totalDurationMs * 0.5), sent: false },
    milestone2: { triggerDate: new Date(start.getTime() + totalDurationMs * 0.75), sent: false },
    milestone3: { triggerDate: new Date(start.getTime() + totalDurationMs * 0.9), sent: false },
    expired: { sent: false },
  };
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify Paystack Signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY as string)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      console.warn("[WEBHOOK SECURITY] Invalid Paystack signature.");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const event = JSON.parse(rawBody);
    if (event.event !== "charge.success") {
      return new NextResponse("OK", { status: 200 }); // Ignore other events
    }

    const { reference, amount, metadata, currency, id, channel, fees, paid_at } = event.data;
    const amountPaidInGhs = amount / 100;
    const paystackFee = fees ? fees / 100 : 0;
    
    // Safety check - Did we already process this?
    await connectToDatabase();
    const existingTx = await Transaction.findOne({ reference });
    if (existingTx && existingTx.status === "Success") {
      return new NextResponse("Already processed", { status: 200 });
    }

    // =========================================================================
    // FLOW 1: LEASE RENEWAL
    // =========================================================================
    if (metadata?.isRenewal && metadata?.leaseId) {
      const existingLease = await Lease.findById(metadata.leaseId).populate("listingId");
      if (!existingLease || !existingLease.listingId) {
        console.error(`[WEBHOOK ERROR] Renewal Lease ${metadata.leaseId} not found.`);
        return new NextResponse("Lease not found", { status: 404 });
      }

      const serverExpectedPrice = existingLease.listingId.price;
      if (amountPaidInGhs < serverExpectedPrice - 1) {
        console.error(`[WEBHOOK SECURITY] Underpayment! Paid: ${amountPaidInGhs}, Owed: ${serverExpectedPrice}`);
        return new NextResponse("Partial payment", { status: 400 });
      }

      const now = new Date();
      const currentEndDate = existingLease.endDate ? new Date(existingLease.endDate) : now;
      const baseDateForExtension = currentEndDate > now ? currentEndDate : now;
      const newEndDate = new Date(baseDateForExtension);
      const term = existingLease.listingId?.terms?.leaseTerm?.toLowerCase() || "";

      if (term.includes("month")) newEndDate.setMonth(newEndDate.getMonth() + 1);
      else if (term.includes("year")) {
        const yearMatch = term.match(/(\d+)_year/);
        const yearsToAdd = yearMatch ? parseInt(yearMatch[1], 10) : 1;
        newEndDate.setFullYear(newEndDate.getFullYear() + yearsToAdd);
      } else newEndDate.setFullYear(newEndDate.getFullYear() + 1);

      const newDynamicReminders = calculateMilestones(baseDateForExtension, newEndDate);

      const dbSession = await mongoose.startSession();
      await dbSession.withTransaction(async () => {
        existingLease.endDate = newEndDate;
        existingLease.reminders = newDynamicReminders;
        if (existingLease.status === "Expired") existingLease.status = "Active";
        await existingLease.save({ session: dbSession });

        await Transaction.create([{
          userId: existingLease.userId,
          listingId: existingLease.listingId._id,
          leaseId: existingLease._id,
          amount: amountPaidInGhs,
          currency: currency || "GHS",
          paymentPurpose: "Lease_Renewal",
          reference,
          transactionReference: reference,
          paystackTransactionId: id.toString(),
          channel: channel || "card",
          paystackFee,
          status: "Success",
          paidAt: new Date(paid_at),
        }], { session: dbSession });
      });
      await dbSession.endSession();

      // Send Renewal Email
      const user = await User.findById(existingLease.userId).select("email");
      if (user?.email) {
        sendEmail({
          to: user.email,
          subject: `Lease Renewal Confirmed: ${existingLease.listingId.title}`,
          react: React.createElement(RenewalConfirmationEmail, {
            propertyTitle: existingLease.listingId.title,
            newEndDate: newEndDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
          }),
        }).catch((err) => console.error("[NON-FATAL] Failed to send renewal email via webhook:", err));
      }
      return new NextResponse("OK", { status: 200 });
    }

    // =========================================================================
    // FLOW 2: INITIAL LEASE (UPFRONT RENT)
    // =========================================================================
    if (metadata?.isInitialLease && metadata?.listingId) {
      const listing = await Listing.findById(metadata.listingId);
      if (!listing) return new NextResponse("Listing not found", { status: 404 });
      if (listing.status === "Rented") return new NextResponse("Already rented", { status: 400 });

      const startDate = new Date(metadata.selectedMoveInDate || Date.now());
      const endDate = new Date(startDate);
      const term = listing.terms?.leaseTerm?.toLowerCase() || "";
      if (term.includes("month")) endDate.setMonth(endDate.getMonth() + 1);
      else if (term.includes("year")) {
        const yearMatch = term.match(/(\d+)_year/);
        const yearsToAdd = yearMatch ? parseInt(yearMatch[1], 10) : 1;
        endDate.setFullYear(endDate.getFullYear() + yearsToAdd);
      } else endDate.setFullYear(endDate.getFullYear() + 1);

      const dynamicReminders = calculateMilestones(startDate, endDate);
      const userId = metadata.userId;

      const dbSession = await mongoose.startSession();
      let newLeaseId = null;
      await dbSession.withTransaction(async () => {
        const newLease = await Lease.create([{
          listingId: metadata.listingId,
          userId: userId,
          totalRentAmount: amountPaidInGhs,
          startDate,
          endDate,
          reminders: dynamicReminders,
          status: "Pending_Verification",
        }], { session: dbSession });
        
        newLeaseId = newLease[0]._id;

        await Transaction.create([{
          userId,
          listingId: metadata.listingId,
          leaseId: newLeaseId,
          amount: amountPaidInGhs,
          currency: currency || "GHS",
          paymentPurpose: "Upfront_Rent",
          reference,
          transactionReference: reference,
          paystackTransactionId: id.toString(),
          channel: channel || "card",
          paystackFee,
          status: "Success",
          paidAt: new Date(paid_at),
        }], { session: dbSession });

        listing.status = "Rented";
        await listing.save({ session: dbSession });
      });
      await dbSession.endSession();

      // Send Receipt Email
      const user = await User.findById(userId).select("email");
      if (user?.email) {
        sendEmail({
          to: user.email,
          subject: `Payment Confirmed: ${listing.title}`,
          react: React.createElement(PaymentReceiptEmail, {
            propertyTitle: listing.title,
            amount: amountPaidInGhs,
            reference,
          }),
        }).catch((err) => console.error("[NON-FATAL] Failed to send receipt via webhook:", err));
      }
      return new NextResponse("OK", { status: 200 });
    }

    return new NextResponse("Unhandled Event", { status: 200 });
  } catch (error: any) {
    console.error("[WEBHOOK FATAL ERROR]:", error.message);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
