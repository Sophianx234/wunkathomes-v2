import { getListingData } from "@/actions/listing.action";
import CheckoutClient from "@/components/checkout-client";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { connectToDatabase } from "@/config/DbConnect";
import User from "@/models/user"; // Ensure you import your User model

interface CheckoutPageProps {
  params: Promise<{ slug: string }>
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  // 1. Secure the route and get the user's session
  const session = await getSession();
  
  

  // 2. Fetch the listing data
  const { slug } = await params;
  const { listing } = await getListingData(slug);

  if (!listing) notFound();

  // 3. Fetch the current user's profile details from the database
  const userRecord = await User.findById(session.userId).lean().exec();
  
  // Serialize the user data to pass to the Client Component safely
  const currentUser = userRecord ? {
    name: userRecord.name || "",
    email: userRecord.email || "",
    phone: userRecord.phone || ""
  } : null;

  // 4. Pass both the listing and the user data down
  return <CheckoutClient listing={listing} currentUser={currentUser} />;
}