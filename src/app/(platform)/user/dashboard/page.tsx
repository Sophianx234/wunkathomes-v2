import { redirect } from "next/navigation"
import { getSession, SessionPayload } from "@/lib/session"
import User from "@/models/user"
import Lease from "@/models/lease"
import "@/models/listing" 
import "@/models/property" // Ensure Property is loaded for deep population

import { UserDashboard } from "@/components/user-dashboard" 
import { connectToDatabase } from "@/config/DbConnect"

export default async function DashboardPage() {
  const session = await getSession() as SessionPayload;
  if (!session?.userId) redirect("/login");

  await connectToDatabase();

  const dbUser = await User.findById(session.userId).lean();
  if (!dbUser) redirect("/login");

  // 1. KYC Check
  if (dbUser.kycStatus === 'Unverified' || dbUser.kycStatus === 'Rejected') {
    redirect("/user/kyc-verification"); 
  }

  // 2. Fetch the Lease with Deep Population (Lease -> Listing -> Property)
  const dbLease = await Lease.findOne({
    userId: session.userId,
    status: { $in: ['Awaiting_Admin_Approval', 'Active'] }
  })
    .select('+smartLockPin')
    .populate({
      path: 'listingId',
      populate: { path: 'propertyId' } // Populates the parent property for amenities/location
    })
    .lean();

  if (!dbLease) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold uppercase tracking-widest text-sm">
        No active leases found. Please explore properties.
      </div>
    )
  }

  // 3. Signature Check (MUST happen after we confirm dbLease exists!)
  if (dbUser.kycStatus === 'Verified' && !dbLease.signatureAudit?.isSigned) {
    redirect("/user/sign-lease"); 
  }

  // 4. Calculate End Date (Default to 1 year if not explicitly set)
  let endDate = dbLease.endDate;
  if (!endDate && dbLease.startDate) {
    const end = new Date(dbLease.startDate);
    end.setFullYear(end.getFullYear() + 1); // Add 12 months
    endDate = end;
  }

  // 5. Serialize the Data
  const serializedUser = {
    name: dbUser.name,
    kycStatus: dbUser.kycStatus || "Unverified",
  };

  const serializedLease = {
    id: dbLease._id.toString(),
    status: dbLease.status,
    totalRentAmount: dbLease.totalRentAmount,
    startDate: dbLease.startDate ? new Date(dbLease.startDate).toISOString() : new Date().toISOString(),
    endDate: endDate ? new Date(endDate).toISOString() : undefined,
    smartLockPin: dbLease.smartLockPin,
    signatureAudit: {
      isSigned: dbLease.signatureAudit?.isSigned || false,
    }
  };

  const listingDoc = dbLease.listingId as any;
  const propertyDoc = listingDoc?.propertyId;
  const loc = propertyDoc?.location || listingDoc?.location;
  const locationString = loc ? (typeof loc === 'string' ? loc : `${loc.area}, ${loc.city || loc.region}`) : "Accra, Ghana";

  const serializedListing = {
    title: listingDoc?.title || "WunkatHomes Property",
    images: listingDoc?.images || [],
    location: locationString,
    propertyType: propertyDoc?.propertyType?.replace('_', ' ') || "Property",
    bedrooms: listingDoc?.features?.bedrooms || 0,
    bathrooms: listingDoc?.features?.bathrooms || 0,
    sizeSqm: listingDoc?.features?.sizeSqm || 0,
    amenities: propertyDoc?.generalAmenities || [],
    wifiNetwork: "Wunkat_5G", 
    wifiPassword: "wunkat2026", 
  };

  return (
    <UserDashboard 
      user={serializedUser} 
      lease={serializedLease} 
      listing={serializedListing} 
    />
  )
}