import { redirect } from "next/navigation";
import { getSession, SessionPayload } from "@/lib/session";
import { connectToDatabase } from "@/config/DbConnect";
import Lease from "@/models/lease";
import User from "@/models/user";
import "@/models/listing";
import SignLeaseClient from "@/components/sign-lease-client";

interface SignLeasePageProps {
  searchParams: Promise<{ leaseId?: string }>;
}

export default async function SignLeasePage({
  searchParams,
}: SignLeasePageProps) {
  const session = (await getSession()) as SessionPayload;
  if (!session?.userId) redirect("/login");

  await connectToDatabase();

  // Resolve searchParams (Required in Next.js 15+)
  const params = await searchParams;
  const targetLeaseId = params?.leaseId;

  const dbUser = await User.findById(session.userId).lean();

  // --- THE FIX: Dynamic Multi-Property Query ---
  const query: any = { userId: session.userId };

  if (targetLeaseId) {
    // 1. If a specific lease is requested via URL (?leaseId=xyz)
    query._id = targetLeaseId;
  } else {
    // 2. Otherwise, automatically find leases that are NOT signed yet
    query["signatureAudit.isSigned"] = { $ne: true };
  }

  // Fetch the lease, sorting by newest first in case there are multiple unsigned
  const dbLease = await Lease.findOne(query)
    .populate("listingId")
    .sort({ createdAt: -1 })
    .lean();

  // 1. Route Protection Checks
  if (!dbLease) {
    // No lease found matching the criteria
    redirect("/");
  }

  if (dbLease.signatureAudit?.isSigned) {
    // If they hit this page but the specific fetched lease is already signed
    redirect("/user/dashboard");
  }

  // 2. Serialize data for the rich client UI
  const listingDoc = dbLease.listingId as any;
  const loc = listingDoc?.propertyId?.location || listingDoc?.location;
  const locationString = loc
    ? typeof loc === "string"
      ? loc
      : `${loc.area}, ${loc.city || loc.region}`
    : "Accra, Ghana";

  const serializedData = {
    leaseId: dbLease._id.toString(),
    tenantName: dbUser?.legalName || dbUser?.name || "Tenant",
    totalRent: dbLease.totalRentAmount,
    startDate: dbLease.startDate
      ? new Date(dbLease.startDate).toLocaleDateString("en-GB")
      : new Date().toLocaleDateString("en-GB"),
    propertyTitle: listingDoc?.title || "WunkatHomes Property",
    propertyLocation: locationString,
  };

  return <SignLeaseClient data={serializedData} />;
}
