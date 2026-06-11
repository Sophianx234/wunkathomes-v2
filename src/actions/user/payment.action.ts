"use server";

import { connectToDatabase } from "@/config/DbConnect";
import { getSession, SessionPayload } from "@/lib/session";
import Transaction from "@/models/transaction";
import Listing from "@/models/listing";
import Lease from "@/models/lease";
import User from "@/models/user";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/resend";
import PaymentReceiptEmail from "@/components/email/payment-reciept-mail";
import RenewalConfirmationEmail from "@/components/email/renewal-confirmation-mail";
import React from "react";
import { z } from "zod";
import mongoose from "mongoose";
import { headers } from "next/headers";

// NOTE: In production, implement Redis rate-limiting to prevent webhook/verification spam
// import { ratelimit } from "@/lib/redis";

// ============================================================================
// 1. STRICT INPUT VALIDATION SCHEMAS (ZOD)
// ============================================================================
// Notice we removed expectedAmount. The server dictates the price.
const verifyPaymentSchema = z.object({
  reference: z.string().min(5, "Invalid reference length").trim(),
  listingId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Listing ID"),
  selectedMoveInDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
});

const renewalSchema = z.object({
  reference: z.string().min(5, "Invalid reference length").trim(),
  leaseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Lease ID"),
});

// ============================================================================
// 2. SERVER ACTIONS
// ============================================================================

export async function verifyPaystackPayment(rawReference: string, rawListingId: string, rawMoveInDate: string) {
  let session;
  let ip = "unknown";

  try {
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for")?.split(',')[0] || "Unknown IP";

    session = await getSession() as SessionPayload;
    if (!session || !session.userId) throw new Error("UNAUTHORIZED");

    // 1. Strict Validation
    const { reference, listingId, selectedMoveInDate } = verifyPaymentSchema.parse({
      reference: rawReference,
      listingId: rawListingId,
      selectedMoveInDate: rawMoveInDate
    });

    await connectToDatabase();

    // 2. Fetch the Source of Truth (Database Pricing) FIRST
    const listing = await Listing.findById(listingId);
    if (!listing) return { success: false, message: "Property not found." };
    if (listing.status === "Rented") return { success: false, message: "Property is already rented." };

    const serverExpectedPrice = listing.price; // THE ONLY PRICE WE TRUST

    // 3. Verify with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });

    if (!response.ok) throw new Error("PAYSTACK_NETWORK_ERROR");
    
    const data = await response.json();
    if (!data.status || data.data.status !== "success") {
      return { success: false, message: "Payment verification failed or is pending." };
    }

    // 4. Server-Side Financial Validation
    const amountPaidInGhs = data.data.amount / 100; 
    if (amountPaidInGhs < (serverExpectedPrice - 1)) {
      console.error(`[SECURITY] Underpayment attempt detected! User ${session.userId} paid ${amountPaidInGhs} but owed ${serverExpectedPrice}`);
      return { success: false, message: "Partial payment detected. Please contact support." };
    }

    // 5. Calculate Dates
    const startDate = new Date(selectedMoveInDate);
    const endDate = new Date(startDate);
    const term = listing.terms?.leaseTerm?.toLowerCase() || "";

    if (term.includes("month")) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (term.includes("year")) {
      const yearMatch = term.match(/(\d+)_year/);
      const yearsToAdd = yearMatch ? parseInt(yearMatch[1], 10) : 1; 
      endDate.setFullYear(endDate.getFullYear() + yearsToAdd);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1); 
    }

    // 6. DATABASE INTEGRITY: Atomic Transaction
    const dbSession = await mongoose.startSession();
    const result = await dbSession.withTransaction(async () => {
      
      // Idempotency check inside the locked transaction
      const existingTx = await Transaction.findOne({ reference }).session(dbSession);
      if (existingTx && existingTx.status === "Success") {
        throw new Error("ALREADY_VERIFIED");
      }

      const newLease = await Lease.create([{
        listingId,
        userId: session.userId,
        totalRentAmount: amountPaidInGhs,
        startDate,
        endDate, 
        status: "Pending_Verification" 
      }], { session: dbSession });

      await Transaction.create([{
        userId: session.userId,
        listingId,
        leaseId: newLease[0]._id, 
        amount: amountPaidInGhs,
        currency: data.data.currency,
        paymentPurpose: "Upfront_Rent", 
        reference,
        transactionReference: reference,
        paystackTransactionId: data.data.id.toString(),
        channel: data.data.channel || "card",
        paystackFee: data.data.fees ? (data.data.fees / 100) : 0,
        status: "Success",
        paidAt: new Date(data.data.paid_at)
      }], { session: dbSession });

      await Listing.findByIdAndUpdate(listingId, { status: "Rented" }, { session: dbSession });

      return "SUCCESS";
    });
    await dbSession.endSession();

    if (result === "SUCCESS") {
      // 7. Fire and Forget Email
      const user = await User.findById(session.userId).select("email");
      if (user?.email) {
        sendEmail({
          to: user.email,
          subject: `Payment Confirmed: ${listing.title}`,
          react: React.createElement(PaymentReceiptEmail, { propertyTitle: listing.title, amount: amountPaidInGhs, reference })
        }).catch(err => console.error("[NON-FATAL] Failed to send receipt:", err));
      }

      revalidatePath("/admin/transactions");
      revalidatePath("/explore");
      revalidatePath("/user/leases");
      revalidatePath(`/properties/${listingId}`); 

      return { success: true, message: "Payment secured successfully!" };
    }

  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return { success: false, message: "Unauthorized: Please log in." };
    if (error.message === "ALREADY_VERIFIED") return { success: true, message: "Payment was already verified!" };
    
    console.error(`[SECURITY LOG] Payment Verification Error (IP: ${ip}):`, error.message);
    return { success: false, message: "A server error occurred during verification." };
  }
}

export async function processLeaseRenewal(rawReference: string, rawLeaseId: string) {
  let session:SessionPayload;
  let ip = "unknown";

  try {
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for")?.split(',')[0] || "Unknown IP";

    session = await getSession() as SessionPayload;
    if (!session || !session.userId) throw new Error("UNAUTHORIZED");

    const { reference, leaseId } = renewalSchema.parse({
      reference: rawReference,
      leaseId: rawLeaseId
    });

    await connectToDatabase();

    // 1. Fetch Source of Truth First (IDOR protection built-in by checking userId)
    const existingLease = await Lease.findOne({ _id: leaseId, userId: session.userId }).populate("listingId");
    if (!existingLease || !existingLease.listingId) {
      return { success: false, message: "Lease not found or unauthorized." };
    }

    const serverExpectedPrice = existingLease.listingId.price; // SERVER DICTATES RENEWAL PRICE

    // 2. Verify with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });

    if (!response.ok) throw new Error("PAYSTACK_NETWORK_ERROR");

    const data = await response.json();
    if (!data.status || data.data.status !== "success") {
      return { success: false, message: "Payment verification failed or is pending." };
    }

    // 3. Server-Side Financial Validation
    const amountPaidInGhs = data.data.amount / 100; 
    if (amountPaidInGhs < (serverExpectedPrice - 1)) {
       console.error(`[SECURITY] Renewal Underpayment! User ${session.userId} paid ${amountPaidInGhs} but owed ${serverExpectedPrice}`);
       return { success: false, message: "Partial payment detected. Please contact support." };
    }

    // 4. Calculate New End Date
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

    // 5. DATABASE INTEGRITY: Atomic Transaction
    const dbSession = await mongoose.startSession();
    const result = await dbSession.withTransaction(async () => {
      
      const existingTx = await Transaction.findOne({ reference }).session(dbSession);
      if (existingTx && existingTx.status === "Success") throw new Error("ALREADY_VERIFIED");

      existingLease.endDate = newEndDate;
      if (existingLease.status === "Expired") existingLease.status = "Active";
      
      // Save passing the session to maintain atomicity
      await existingLease.save({ session: dbSession });

      await Transaction.create([{
        userId: session.userId,
        listingId: existingLease.listingId._id,
        leaseId: existingLease._id, 
        amount: amountPaidInGhs,
        currency: data.data.currency,
        paymentPurpose: "Lease_Renewal", 
        reference,
        transactionReference: reference,
        paystackTransactionId: data.data.id.toString(),
        channel: data.data.channel || "card",
        paystackFee: data.data.fees ? (data.data.fees / 100) : 0,
        status: "Success",
        paidAt: new Date(data.data.paid_at)
      }], { session: dbSession });

      return "SUCCESS";
    });
    await dbSession.endSession();

    if (result === "SUCCESS") {
      // 6. Fire and Forget Email
      const user = await User.findById(session.userId).select("email");
      if (user?.email) {
        sendEmail({
          to: user.email,
          subject: `Lease Renewal Confirmed: ${existingLease.listingId.title}`,
          react: React.createElement(RenewalConfirmationEmail, {
            propertyTitle: existingLease.listingId.title,
            newEndDate: newEndDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
          })
        }).catch(err => console.error("[NON-FATAL] Failed to send renewal email:", err));
      }

      revalidatePath("/user/dashboard");
      revalidatePath("/user/transactions");
      revalidatePath("/admin/transactions");

      return { success: true, message: "Lease successfully renewed!" };
    }

  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return { success: false, message: "Unauthorized: Please log in." };
    if (error.message === "ALREADY_VERIFIED") return { success: true, message: "Renewal payment was already verified!" };

    console.error(`[SECURITY LOG] Renewal Error (IP: ${ip}):`, error.message);
    return { success: false, message: "A server error occurred during renewal verification." };
  }
}