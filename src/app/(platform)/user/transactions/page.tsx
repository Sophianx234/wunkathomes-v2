import { getSession, SessionPayload } from "@/lib/session";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/config/DbConnect";
import Transaction from "@/models/transaction";
import "@/models/listing"; 
import "@/models/property"; // Required for deep population of the propertyType/location
import "@/models/user"; 
import TransactionsClient from "@/components/transactions-client";

export const metadata = {
  title: "Payment Ledger | WunkatHomes",
  description: "View your transaction history and download receipts.",
};

export default async function UserTransactionsPage() {
  const session = await getSession() as SessionPayload;
  if (!session?.userId) redirect("/login");

  await connectToDatabase();

  // Fetch transactions and DEEPLY populate Listing -> Property AND User
  const dbTransactions = await Transaction.find({ userId: session.userId })
    .populate({
      path: "listingId",
      populate: { path: "propertyId" } // Deep populate to get the Property Type and Location
    })
    .populate("userId", "name email profilePicture")
    .sort({ createdAt: -1 })
    .lean();

  // Serialize the data to MATCH the TransactionsClient interface exactly
  const serializedTransactions = dbTransactions.map((tx: any) => {
    const listing = tx.listingId || {};
    const property = listing.propertyId || {};
    
    // Safely extract location
    const loc = property.location || listing.location;
    const locationString = loc ? (typeof loc === 'string' ? loc : `${loc.area}, ${loc.city || loc.region}`) : "Accra, Ghana";

    return {
      id: tx._id.toString(),
      reference: tx.reference || "N/A",
      createdAt: tx.createdAt ? new Date(tx.createdAt).toISOString() : new Date().toISOString(),
      paidAt: tx.paidAt ? new Date(tx.paidAt).toISOString() : null,
      amount: tx.amount || 0,
      currency: tx.currency || "GHS",
      paymentPurpose: tx.paymentPurpose || "Upfront_Rent",
      channel: tx.channel || "pending",
      status: tx.status || "Pending",
      leaseId: tx.leaseId ? tx.leaseId.toString() : null,
      
      // Grouping User Data
      user: {
        name: tx.userId?.name || session.name || "Verified Tenant",
        email: tx.userId?.email || session.email || "N/A",
        profilePicture: tx.userId?.profilePicture || undefined,
      },
      
      // Grouping Listing Data
      listing: {
        id: listing._id?.toString() || "",
        slug: listing.slug || "",
        title: listing.title || "WunkatHomes Property",
        price: listing.price || 0,
        image: listing.images?.[0] || listing.media?.[0] || "",
        features: {
          bedrooms: listing.features?.bedrooms || 0,
          bathrooms: listing.features?.bathrooms || 0,
          sizeSqm: listing.features?.sizeSqm || 0,
        },
        property: {
          propertyType: property.propertyType || "Property",
          location: locationString,
          propertyName: property.propertyName || "",
        },
      }
    };
  });

  return <TransactionsClient data={serializedTransactions} />;
}