import { getListingData } from "@/actions/user/listing.action";
import CheckoutClient from "@/components/checkout-client";
import { notFound, redirect } from "next/navigation";
import { getSession, SessionPayload } from "@/lib/session";
import { connectToDatabase } from "@/config/DbConnect";
import User from "@/models/user"; 
import Lease from "@/models/lease"; // 1. Import the Lease model

interface CheckoutPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  // Secure the route and get the user's session
  const session = await getSession() as SessionPayload;

  // Fetch the listing data
  const { slug } = await params;
  const { listing } = await getListingData(slug);

  if (!listing) notFound();

  await connectToDatabase();

  // =====================================================================
  // NEW: GUARD AGAINST DOUBLE PAYMENTS / ACTIVE SUBSCRIPTIONS
  // =====================================================================
  if (session && session.userId) {
    const activeLease = await Lease.findOne({
      userId: session.userId,
      listingId: listing._id,
      // Check for statuses that indicate they currently hold the property
      status: { $in: ["Pending_Verification", "Active", "Approved"] },
    }).lean().exec();

    // If an active lease is found, they shouldn't be on the checkout page
    if (activeLease?.signatureAudit?.isSigned) {
      // Redirect them to their leases dashboard (update this route to match your app's structure if needed)
      redirect("/user/dashboard"); 
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
        id: userRecord._id.toString(), // Added ID since your client config requires it for metadata
      };
    }
  }

  // Pass both the listing and the user data down
  return <CheckoutClient listing={listing} currentUser={currentUser} />;
}