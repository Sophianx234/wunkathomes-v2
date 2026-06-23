import { connectToDatabase } from "@/config/DbConnect";
import Transaction from "@/models/transaction";
import User from "@/models/user";
import Listing from "@/models/listing";
import Property from "@/models/property";
import Lease from "@/models/lease";
import TransactionsClient from "@/components/transaction-client";

export const dynamic = "force-dynamic";

async function getTransactions() {
  await connectToDatabase();

  const rawTransactions = await Transaction.find()
    .populate({ path: "userId", model: User })
    .populate({
      path: "listingId",
      model: Listing,
      populate: { path: "propertyId", model: Property },
    })
    .populate({ path: "leaseId", model: Lease })
    .sort({ createdAt: -1 })
    .lean();

  // Serialize Mongoose docs into a safe interface for the Client Component
  return rawTransactions.map((tx: any) => ({
    id: tx._id.toString(),
    reference: tx.reference || "N/A",
    amount: tx.amount || 0,
    currency: tx.currency || "GHS",
    paymentPurpose: tx.paymentPurpose,
    channel: tx.channel || "pending",
    status: tx.status || "Pending",
    createdAt: tx.createdAt.toISOString(),
    paidAt: tx.paidAt ? tx.paidAt.toISOString() : null,
    user: {
      name: tx.userId?.name || "Unknown User",
      email: tx.userId?.email || "",
      profilePicture: tx.userId?.profilePicture || null,
    },
    leaseId: tx.leaseId?._id?.toString() || null,
    listing: {
      id: tx.listingId?._id?.toString() || "",
      slug: tx.listingId?.slug || "",
      title: tx.listingId?.title || "Unknown Listing",
      price: tx.listingId?.price || 0,
      image: tx.listingId?.images?.[0] || "/placeholder.jpg",
      features: {
        bedrooms: tx.listingId?.features?.bedrooms || 0,
        bathrooms: tx.listingId?.features?.bathrooms || 0,
        sizeSqm: tx.listingId?.features?.sizeSqm || 0,
      },
      property: {
        propertyType: tx.listingId?.propertyId?.propertyType || "Unknown",
        location: tx.listingId?.propertyId?.location
          ? `${tx.listingId.propertyId.location.area}, ${tx.listingId.propertyId.location.region}`
          : "Unknown Location",
      },
    },
  }));
}

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return <TransactionsClient initialTransactions={transactions} />;
}
