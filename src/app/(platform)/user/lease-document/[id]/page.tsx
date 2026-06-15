import { getSession, SessionPayload } from "@/lib/session";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/config/DbConnect";
import Lease from "@/models/lease";
import User from "@/models/user";
import "@/models/listing";
import "@/models/property";
import DocumentVaultClient from "@/components/document-valut-client";

// 1. Update the type to explicitly declare params as a Promise
type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function LeaseDocumentPage({ params }: PageProps) {
  // 2. Await the params before accessing the ID
  const { id } = await params;

  const session = (await getSession()) as SessionPayload;
  if (!session?.userId) redirect("/login");

  // 3. Use the unwrapped 'id' variable
  if (!id) redirect("/user/dashboard");

  await connectToDatabase();

  // Fetch User for legal name
  const dbUser = await User.findById(session.userId).lean();

  // 4. Use the unwrapped 'id' variable in your MongoDB query
  const lease = await Lease.findOne({
    _id: id,
    userId: session.userId,
  })
    .populate({
      path: "listingId",
      populate: { path: "propertyId" },
    })
    .lean();

  if (!lease || !dbUser) redirect("/user/dashboard");

  // Safely extract location
  const listingDoc = lease.listingId as any;
  const propertyDoc = listingDoc?.propertyId;
  const loc = propertyDoc?.location || listingDoc?.location;
  const locationString = loc
    ? typeof loc === "string"
      ? loc
      : `${loc.area}, ${loc.city || loc.region}`
    : "Accra, Ghana";

  // Calculate Expiry
  const startDate = new Date(lease.startDate);
  const endDate = lease.endDate
    ? new Date(lease.endDate)
    : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

  // Serialize the payload for the client
  const documentData = {
    leaseId: lease._id.toString(),
    tenantName: dbUser.legalName || dbUser.name,
    propertyTitle: listingDoc?.title || "WunkatHomes Property",
    propertyLocation: locationString,
    totalRent: lease.totalRentAmount,
    startDate: startDate.toLocaleDateString("en-GB"),
    endDate: endDate.toLocaleDateString("en-GB"),
    signature: {
      isSigned: lease.signatureAudit?.isSigned || false,
      typedName: lease.signatureAudit?.typedName || "N/A",
      signedAt: lease.signatureAudit?.signedAt
        ? new Date(lease.signatureAudit.signedAt).toLocaleString("en-GB")
        : "N/A",
      ipAddress: lease.signatureAudit?.ipAddress || "N/A",
      documentHash: lease.signatureAudit?.documentHash || "Pending...",
    },
  };

  return <DocumentVaultClient data={documentData} />;
}
