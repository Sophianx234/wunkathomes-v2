import { Suspense } from "react";
import { connectToDatabase } from "@/config/DbConnect";
import Transaction from "@/models/transaction";
import User from "@/models/user";
import Listing from "@/models/listing";
import Property from "@/models/property";
import Lease from "@/models/lease";
import TransactionsClient from "@/components/transaction-client";

export const dynamic = "force-dynamic";

function TransactionsSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans w-full">
      <div className="max-w-[1400px] mx-auto">
        <div className="w-full bg-white border border-zinc-200/60 rounded-lg overflow-hidden animate-[pulse_1.8s_ease-in-out_infinite]">
          <div className="h-14 border-b border-zinc-200/60 bg-slate-50/50" />
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-20 border-b border-zinc-200/60 flex items-center px-4 gap-6">
              <div className="w-12 h-12 bg-zinc-100/50 rounded-full shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-zinc-100/50 rounded w-1/3" />
                <div className="h-3 bg-zinc-100/50 rounded w-1/4" />
              </div>
              <div className="w-24 h-4 bg-zinc-100/50 rounded shrink-0 hidden md:block" />
              <div className="w-24 h-6 bg-zinc-100/50 rounded-md shrink-0" />
              <div className="w-16 h-8 bg-zinc-100/50 rounded-md shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function DataLoader({ page }: { page: number }) {
  await connectToDatabase();

  const limit = 12;
  const skipAmount = (page - 1) * limit;

  const rawTransactions = await Transaction.find()
    .populate({ path: "userId", model: User })
    .populate({
      path: "listingId",
      model: Listing,
      populate: { path: "propertyId", model: Property },
    })
    .populate({ path: "leaseId", model: Lease })
    .sort({ createdAt: -1 })
    .skip(skipAmount)
    .limit(limit)
    .lean();

  const transactions = rawTransactions.map((tx: any) => ({
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

  return <TransactionsClient initialTransactions={transactions} />;
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams.page || "1", 10));

  return (
    <Suspense key={currentPage} fallback={<TransactionsSkeleton />}>
      <DataLoader page={currentPage} />
    </Suspense>
  );
}
