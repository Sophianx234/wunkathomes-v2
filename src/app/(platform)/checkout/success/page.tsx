import { notFound, redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { connectToDatabase } from "@/config/DbConnect"
import Transaction from "@/models/transaction"
import "@/models/listing" // Register schema
import "@/models/user"    // Register schema
import "@/models/property" // Register schema for nested location populating
import SuccessReceipt from "@/components/success-reciept"

interface SuccessPageProps {
  searchParams: Promise<{ reference?: string }>
}

export default async function CheckoutSuccessPage(props: SuccessPageProps) {
  // 1. Check Authorization
  const session = await getSession()
  if (!session || !session.userId) {
    redirect("/login")
  }

  // 2. Extract Reference from URL
  const searchParams = await props.searchParams
  const reference = searchParams.reference

  if (!reference) {
    // If they navigate here without a reference, send them to their dashboard
    redirect("/user/leases")
  }

  // 3. Fetch the exact transaction from the database
  await connectToDatabase()
  
  const rawTransaction = await Transaction.findOne({ 
    reference: reference,
    userId: session.userId // Security: Ensure this user actually owns this receipt!
  })
    .populate({
      path: "listingId",
      populate: { path: "propertyId" } // Deep populate to get the location details
    })
    .populate("userId", "name email")
    .lean()
    .exec()

  if (!rawTransaction) {
    // If the reference is invalid or doesn't belong to them
    notFound()
  }

  // 4. Serialize data for the Client Component (Convert ObjectIds to strings)
  const serializedTransaction = {
    ...rawTransaction,
    _id: rawTransaction._id.toString(),
    userId: {
      ...rawTransaction.userId,
      _id: rawTransaction.userId?._id?.toString()
    },
    listingId: {
      ...rawTransaction.listingId,
      _id: rawTransaction.listingId?._id?.toString(),
      propertyId: {
        ...rawTransaction.listingId?.propertyId,
        _id: rawTransaction.listingId?.propertyId?._id?.toString()
      }
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 md:py-20 px-4 sm:px-6">
      <SuccessReceipt transaction={serializedTransaction} />
    </main>
  )
}