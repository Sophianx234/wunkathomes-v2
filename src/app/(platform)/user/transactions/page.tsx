import { getSession, SessionPayload } from "@/lib/session";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/config/DbConnect";
import Transaction from "@/models/transaction";
import "@/models/listing"; 
import "@/models/user"; // Ensure User model is loaded for population
import TransactionsClient from "@/components/transactions-client";

export const metadata = {
  title: "Payment Ledger | WunkatHomes",
  description: "View your transaction history and download receipts.",
};

export default async function UserTransactionsPage() {
  const session = await getSession() as SessionPayload;
  if (!session?.userId) redirect("/login");

  await connectToDatabase();

  // Fetch transactions and populate Listing (for title/images) AND User (for receipt details)
  const dbTransactions = await Transaction.find({ userId: session.userId })
    .populate("listingId", "title media images location propertyId") 
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  // Serialize the data for the client component
  const serializedTransactions = dbTransactions.map((tx: any) => {
    // Safely extract location whether it's directly on the listing or nested in a property ref
    const loc = tx.listingId?.location || tx.listingId?.propertyId?.location;
    const locationString = loc ? (typeof loc === 'string' ? loc : `${loc.area}, ${loc.city || loc.region}`) : "Accra, Ghana";

    return {
      id: tx._id.toString(),
      reference: tx.reference,
      createdAt: tx.createdAt ? new Date(tx.createdAt).toISOString() : new Date().toISOString(),
      paidAt: tx.paidAt ? new Date(tx.paidAt).toISOString() : null,
      amount: tx.amount,
      currency: tx.currency || "GHS",
      paymentPurpose: tx.paymentPurpose,
      channel: tx.channel || "pending",
      status: tx.status,
      propertyTitle: tx.listingId?.title || "WunkatHomes Property",
      propertyImage: tx.listingId?.media?.[0] || tx.listingId?.images?.[0] || null,
      propertyLocation: locationString,
      userName: tx.userId?.name || session.name || "Verified Tenant",
      userEmail: tx.userId?.email || session.email || "N/A",
    };
  });

  return <TransactionsClient data={serializedTransactions} />;
}