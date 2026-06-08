import { redirect } from "next/navigation"
import { getSession, SessionPayload } from "@/lib/session"
import { connectToDatabase } from "@/config/DbConnect"
import Lease from "@/models/lease"
import User from "@/models/user"
import "@/models/listing" 
import SignLeaseClient from "@/components/sign-lease-client"

export default async function SignLeasePage() {
  const session = await getSession() as SessionPayload;
  if (!session?.userId) redirect("/login");

  await connectToDatabase();

  const dbUser = await User.findById(session.userId).lean();
  const dbLease = await Lease.findOne({ userId: session.userId })
    .populate('listingId')
    .lean();

  // 1. Route Protection Checks
  if (!dbLease) redirect("/");
  
 

  if (dbLease.signatureAudit?.isSigned) {
    redirect("/user/dashboard"); 
  }

  // 2. Serialize data for the rich client UI
  const listingDoc = dbLease.listingId as any;
  const loc = listingDoc?.propertyId?.location || listingDoc?.location;
  const locationString = loc ? (typeof loc === 'string' ? loc : `${loc.area}, ${loc.city || loc.region}`) : "Accra, Ghana";

  const serializedData = {
    leaseId: dbLease._id.toString(),
    tenantName: dbUser?.legalName || dbUser?.name || "Tenant",
    totalRent: dbLease.totalRentAmount,
    startDate: dbLease.startDate ? new Date(dbLease.startDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
    propertyTitle: listingDoc?.title || "WunkatHomes Property",
    propertyLocation: locationString,
  };

  return <SignLeaseClient data={serializedData} />
}