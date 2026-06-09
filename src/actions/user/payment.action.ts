"use server"

import { connectToDatabase } from "@/config/DbConnect"
import { getSession } from "@/lib/session"
import Transaction from "@/models/transaction"
import Listing from "@/models/listing"
import { revalidatePath } from "next/cache"
import Lease from "@/models/lease"

export async function verifyPaystackPayment(reference: string, listingId: string, expectedAmountInGhs: number,selectedMoveInDate: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, message: "Unauthorized: Please log in." };
    }

    await connectToDatabase();

    // 1. Verify with Paystack API
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // MUST be the Secret Key
      },
    });

    const data = await response.json();

    if (!data.status || data.data.status !== "success") {
      return { success: false, message: "Payment verification failed or is pending." };
    }

    // 2. Security Check: Did they pay the right amount? 
    // Paystack returns amount in pesewas. We divide by 100 to get GHS.
    const amountPaidInGhs = data.data.amount / 100; 
    
    // We use a slight tolerance (e.g., 1 GHS) for rounding errors during math conversion
    if (amountPaidInGhs < (expectedAmountInGhs - 1)) {
      return { success: false, message: "Partial payment detected. Please contact support." };
    }

    // 3. Prevent Duplicate Verifications (Idempotency)
    // If a user clicks verify twice, or if a webhook fires at the same time
    const existingTx = await Transaction.findOne({ reference });
    if (existingTx && existingTx.status === "Success") {
      return { success: true, message: "Payment was already verified!" };
    }

    // ==========================================================
    // NEW: FETCH LISTING AND CALCULATE LEASE END DATE
    // ==========================================================
    const listing = await Listing.findById(listingId).lean();
    if (!listing) {
      return { success: false, message: "Property not found." };
    }

    const startDate = new Date(selectedMoveInDate);
    const endDate = new Date(startDate);
    const term = listing.terms?.leaseTerm?.toLowerCase() || "";

    // Parse the leaseTerm string (month, 1_Year, 2_Years, etc.)
    if (term.includes("month")) {
      endDate.setMonth(endDate.getMonth() + 1); // Add 1 Month
    } else if (term.includes("year")) {
      // Extract the number before "_year" (e.g., "1", "2")
      const yearMatch = term.match(/(\d+)_year/);
      const yearsToAdd = yearMatch ? parseInt(yearMatch[1], 10) : 1; // Default to 1 if no number found
      endDate.setFullYear(endDate.getFullYear() + yearsToAdd);
    } else {
      // Safe fallback if the term is empty or unrecognized
      endDate.setFullYear(endDate.getFullYear() + 1); 
    }

    // 4. Create the Lease
    const newLease = await Lease.create({
      listingId: listingId,
      userId: session.userId,
      totalRentAmount: amountPaidInGhs,
      startDate: startDate,
      endDate: endDate, // <--- SAVING THE CALCULATED END DATE
      status: "Pending_Verification" 
    });

    // 4. Record the Transaction in the database using your updated Schema
  await Transaction.create({
      userId: session.userId,
      listingId: listingId,
      leaseId: newLease._id, // LINK THE TRANSACTION TO THE NEW LEASE
      amount: amountPaidInGhs,
      currency: data.data.currency,
      paymentPurpose: "Upfront_Rent", 
      reference: reference,
      transactionReference: reference,
      paystackTransactionId: data.data.id.toString(),
      channel: data.data.channel || "card",
      paystackFee: data.data.fees ? (data.data.fees / 100) : 0,
      status: "Success",
      paidAt: new Date(data.data.paid_at)
    });

    // 5. Update the Listing Status so no one else can rent it
    await Listing.findByIdAndUpdate(listingId, { status: "Rented" });

    // 6. Revalidate routes to clear cached UI
    revalidatePath("/admin/transactions");
    revalidatePath("/explore");
    revalidatePath("/user/leases");
    revalidatePath(`/properties/${listingId}`); // If you use listingId in the URL

    return { success: true, message: "Payment secured successfully!" };

  } catch (error) {
    console.error("Verification Error:", error);
    return { success: false, message: "A server error occurred during verification." };
  }
}

export async function processLeaseRenewal(reference: string, leaseId: string, expectedAmountInGhs: number) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, message: "Unauthorized: Please log in." };
    }

    await connectToDatabase();

    // 1. Verify with Paystack API
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // MUST be the Secret Key
      },
    });

    const data = await response.json();

    if (!data.status || data.data.status !== "success") {
      return { success: false, message: "Payment verification failed or is pending." };
    }

    // 2. Security Check: Did they pay the right amount? 
    const amountPaidInGhs = data.data.amount / 100; 
    
    // We use a slight tolerance (e.g., 1 GHS) for rounding errors
    if (amountPaidInGhs < (expectedAmountInGhs - 1)) {
      return { success: false, message: "Partial payment detected. Please contact support." };
    }

    // 3. Prevent Duplicate Verifications (Idempotency)
    const existingTx = await Transaction.findOne({ reference });
    if (existingTx && existingTx.status === "Success") {
      return { success: true, message: "Renewal payment was already verified!" };
    }

    // ==========================================================
    // 4. FETCH LEASE & CALCULATE THE NEW EXTENDED END DATE
    // ==========================================================
    const existingLease = await Lease.findOne({ _id: leaseId, userId: session.userId })
      .populate("listingId");
      
    if (!existingLease) {
      return { success: false, message: "Lease not found or unauthorized." };
    }

    const now = new Date();
    const currentEndDate = existingLease.endDate ? new Date(existingLease.endDate) : now;
    
    // THE MAGIC LOGIC: 
    // If they have days left, we add time to their CURRENT end date so they don't lose days.
    // If they are expired (in grace period), we start the new clock from TODAY.
    const baseDateForExtension = currentEndDate > now ? currentEndDate : now;
    const newEndDate = new Date(baseDateForExtension);

    const term = existingLease.listingId?.terms?.leaseTerm?.toLowerCase() || "";

    // Parse the leaseTerm string (month, 1_year, 2_years, etc.)
    if (term.includes("month")) {
      newEndDate.setMonth(newEndDate.getMonth() + 1); // Add 1 Month
    } else if (term.includes("year")) {
      const yearMatch = term.match(/(\d+)_year/);
      const yearsToAdd = yearMatch ? parseInt(yearMatch[1], 10) : 1; 
      newEndDate.setFullYear(newEndDate.getFullYear() + yearsToAdd);
    } else {
      // Safe fallback if the term is unrecognized
      newEndDate.setFullYear(newEndDate.getFullYear() + 1); 
    }

    // 5. Update the existing Lease Document
    existingLease.endDate = newEndDate;
    
    // If they were locked out or in restricted mode, ensure they are set back to Active
    if (existingLease.status === "Expired") {
      existingLease.status = "Active";
    }
    
    await existingLease.save();

    // 6. Record the Renewal Transaction in the database
    await Transaction.create({
      userId: session.userId,
      listingId: existingLease.listingId._id,
      leaseId: existingLease._id, 
      amount: amountPaidInGhs,
      currency: data.data.currency,
      paymentPurpose: "Lease_Renewal", // Flagged specifically as a renewal
      reference: reference,
      transactionReference: reference,
      paystackTransactionId: data.data.id.toString(),
      channel: data.data.channel || "card",
      paystackFee: data.data.fees ? (data.data.fees / 100) : 0,
      status: "Success",
      paidAt: new Date(data.data.paid_at)
    });

    // 7. Revalidate routes to instantly update the tenant dashboard UI
    revalidatePath("/user/dashboard");
    revalidatePath("/user/transactions");
    revalidatePath("/admin/transactions");

    return { success: true, message: "Lease successfully renewed!" };

  } catch (error) {
    console.error("Renewal Verification Error:", error);
    return { success: false, message: "A server error occurred during renewal verification." };
  }
}