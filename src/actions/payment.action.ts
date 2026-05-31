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

    const newLease = await Lease.create({
      listingId: listingId,
      userId: session.userId,
      totalRentAmount: amountPaidInGhs,
      startDate: new Date(selectedMoveInDate),
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