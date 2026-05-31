import { redirect } from "next/navigation"
import { getSession, SessionPayload } from "@/lib/session"
import User from "@/models/user"
import Lease from "@/models/lease"
import "@/models/listing" // Ensure listing is registered for population

// Import your beautifully built Client Component
import { UserDashboard } from "@/components/user-dashboard" 
import { connectToDatabase } from "@/config/DbConnect"

export default async function DashboardPage() {
  // 1. Session Check
  const session = await getSession() as SessionPayload
  await connectToDatabase()
 
 
  const dbUser = await User.findById(session.userId).lean()
  if (!dbUser) redirect("/login")
  // Fetch the active or pending lease for this user.
  // We use .select('+smartLockPin') because your schema hides the PIN by default.
  const dbLease = await Lease.findOne({
    userId: session.userId,
    status: { $in: ['Awaiting_Admin_Approval', 'Active'] }
  })
    .select('+smartLockPin')
    .populate('listingId')
    .lean()

  // If they don't have a lease yet, show a fallback or redirect
  if (!dbLease) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold uppercase tracking-widest text-sm">
        No active leases found. Please explore properties.
      </div>
    )
  }

  // 3. Serialize the Data (Convert ObjectIds and Dates to strings for the Client)
  const serializedUser = {
    name: dbUser.name,
    kycStatus: dbUser.kycStatus || "Unverified",
  }

  const serializedLease = {
    id: dbLease._id.toString(),
    status: dbLease.status,
    totalRentAmount: dbLease.totalRentAmount,
    startDate: dbLease.startDate ? new Date(dbLease.startDate).toISOString() : new Date().toISOString(),
    endDate: dbLease.endDate ? new Date(dbLease.endDate).toISOString() : undefined,
    smartLockPin: dbLease.smartLockPin,
    signatureAudit: {
      isSigned: dbLease.signatureAudit?.isSigned || false,
    }
  }

  // Extract populated listing details safely
  const listingDoc = dbLease.listingId as any
  
  // Safely extract location (handling both string and object location schemas)
  const loc = listingDoc?.propertyId?.location || listingDoc?.location
  const locationString = loc ? (typeof loc === 'string' ? loc : `${loc.area}, ${loc.city || loc.region}`) : "Accra, Ghana"

  const serializedListing = {
    title: listingDoc?.title || "WunkatHomes Property",
    images: listingDoc?.images || [],
    location: locationString,
    wifiNetwork: "Wunkat_5G", // Placeholder until added to schema
    wifiPassword: "wunkat2026", // Placeholder until added to schema
  }

  // 4. Render the Client Component with the Default Export
  return (
    <UserDashboard 
      user={serializedUser} 
      lease={serializedLease} 
      listing={serializedListing} 
    />
  )
}