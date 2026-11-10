import { getListingData } from "@/actions/user/listing.action";

import { notFound, redirect } from "next/navigation";
import { getSession, SessionPayload } from "@/lib/session";
import { connectToDatabase } from "@/config/DbConnect";
import User from "@/models/user";
import Lease from "@/models/lease";
import Transaction from "@/models/transaction";
import CheckoutWrapper from "@/components/checkout-wrapper";

interface CheckoutPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  // Secure the route and get the user's session
  const session = (await getSession()) as SessionPayload;

  // Fetch the listing data
  const { slug } = await params;
  const { listing } = await getListingData(slug);

  if (!listing) notFound();

  // If already rented or sold, redirect back to property page
  if (listing.status === "Rented" || listing.status === "Sold") {
    redirect(`/properties/${slug}`);
  }

  await connectToDatabase();

  // =====================================================================
  // GUARD AGAINST DOUBLE PAYMENTS: Only redirect if lease is already Active or Approved
  // =====================================================================
  let existingPendingReservation = null;

  if (session && session.userId) {
    const finalizedLease = await Lease.findOne({
      userId: session.userId,
      listingId: listing.id,
      status: { $in: ["Active", "Approved"] },
    })
      .lean()
      .exec();

    // If an active/approved lease is found, they already own/rent the property
    if (finalizedLease?.signatureAudit?.isSigned) {
      redirect("/user/dashboard");
    }

    // Check if the user already has an active pending bank transfer reservation
    const pendingTx = await Transaction.findOne({
      userId: session.userId,
      listingId: listing.id,
      status: "Pending",
      channel: "bank",
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (pendingTx) {
      existingPendingReservation = {
        reference: pendingTx.reference,
        amount: pendingTx.amount,
      };
    }
  }

  // Fetch the current user's profile details from the database
  let currentUser = null;

  if (session && session.userId) {
    const userRecord = await User.findById(session.userId).lean().exec();

    if (userRecord) {
      currentUser = {
        name: userRecord.name || "",
        email: userRecord.email || "",
        phone: userRecord.phone || "",
        id: userRecord._id.toString(),
      };
    }
  }

  // Pass listing, user, and any existing pending reservation down
  return (
    <CheckoutWrapper 
      listing={listing} 
      currentUser={currentUser} 
      existingPendingReservation={existingPendingReservation} 
    />
  );
}
