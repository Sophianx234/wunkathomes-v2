import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { connectToDatabase } from "@/config/DbConnect";
import Transaction from "@/models/transaction";
import "@/models/listing";
import "@/models/user";
import "@/models/property";
import SuccessReceipt from "@/components/success-reciept";

interface SuccessPageProps {
  searchParams: Promise<{ reference?: string }>;
}

export default async function CheckoutSuccessPage(props: SuccessPageProps) {
  const session = await getSession();
  if (!session || !session.userId) {
    redirect("/login");
  }

  const searchParams = await props.searchParams;
  const reference = searchParams.reference;

  if (!reference) {
    redirect("/user/dashboard");
  }

  await connectToDatabase();

  const rawTransaction = await Transaction.findOne({
    reference: reference,
    userId: session.userId,
  })
    .populate({
      path: "listingId",
      populate: { path: "propertyId" },
    })
    // FIX: Make sure to fetch the kycStatus here!
    .populate("userId", "name email kycStatus")
    .lean()
    .exec();

  if (!rawTransaction) {
    notFound();
  }

  const serializedTransaction = {
    ...rawTransaction,
    _id: rawTransaction._id.toString(),
    leaseId: rawTransaction.leaseId?.toString(),
    userId: {
      ...rawTransaction.userId,
      _id: rawTransaction.userId?._id?.toString(),
      // Explicitly attach the status
      kycStatus: (rawTransaction.userId as any)?.kycStatus,
    },
    listingId: {
      ...rawTransaction.listingId,
      _id: rawTransaction.listingId?._id?.toString(),
      propertyId: {
        ...rawTransaction.listingId?.propertyId,
        _id: rawTransaction.listingId?.propertyId?._id?.toString(),
      },
    },
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 md:py-20 px-4 sm:px-6">
      <SuccessReceipt transaction={serializedTransaction} />
    </main>
  );
}
