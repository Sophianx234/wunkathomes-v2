import { getSession, SessionPayload } from "@/lib/session"
import { redirect } from "next/navigation"
import { connectToDatabase } from "@/config/DbConnect"
import Lease from "@/models/lease"
import User from "@/models/user"
import "@/models/listing"
import "@/models/property"
import DocumentVaultClient from "@/components/document-valut-client"

export default async function LeaseDocumentPage() {
  const session = await getSession() as SessionPayload
  if (!session?.userId) redirect("/login")

  await connectToDatabase()

  // Fetch User for legal name
  const dbUser = await User.findById(session.userId).lean()
  
  // Fetch Lease and deeply populate the property details
  const lease = await Lease.findOne({ userId: session.userId, status: "Active" })
    .populate({
      path: 'listingId',
      populate: { path: 'propertyId' }
    })
    .lean()

  if (!lease || !dbUser) redirect("/user/dashboard")

  // Safely extract location
  const listingDoc = lease.listingId as any;
  const propertyDoc = listingDoc?.propertyId;
  const loc = propertyDoc?.location || listingDoc?.location;
  const locationString = loc ? (typeof loc === 'string' ? loc : `${loc.area}, ${loc.city || loc.region}`) : "Accra, Ghana";

  // Calculate Expiry
  const startDate = new Date(lease.startDate);
  const endDate = lease.endDate ? new Date(lease.endDate) : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

  // Serialize the payload for the client
  const documentData = {
    leaseId: lease._id.toString(),
    tenantName: dbUser.legalName || dbUser.name,
    propertyTitle: listingDoc?.title || "WunkatHomes Property",
    propertyLocation: locationString,
    totalRent: lease.totalRentAmount,
    startDate: startDate.toLocaleDateString('en-GB'),
    endDate: endDate.toLocaleDateString('en-GB'),
    signature: {
      isSigned: lease.signatureAudit?.isSigned || false,
      typedName: lease.signatureAudit?.typedName || "N/A",
      signedAt: lease.signatureAudit?.signedAt ? new Date(lease.signatureAudit.signedAt).toLocaleString('en-GB') : "N/A",
      ipAddress: lease.signatureAudit?.ipAddress || "N/A",
      documentHash: lease.signatureAudit?.documentHash || "Pending..."
    }
  }

  return <DocumentVaultClient data={documentData} />
}