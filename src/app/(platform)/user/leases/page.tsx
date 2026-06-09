import { VerificationDashboard } from "@/components/verification-dashboard"
import { connectToDatabase } from "@/config/DbConnect"
import { getSession, SessionPayload } from "@/lib/session"
import User from "@/models/user"
import Lease from "@/models/lease"
import { redirect } from "next/navigation"

export default async function LeasesPage() {
  const session = await getSession() as SessionPayload;
  if (!session?.userId) redirect("/login");

  await connectToDatabase();

  // 1. DATA FETCHING: Get the real user
  const dbUser = await User.findById(session.userId).select('+idDocumentNumber').lean();
  if (!dbUser) redirect("/login");

  // 2. DATA FETCHING: Get the user's active/pending lease
  const dbLease = await Lease.findOne({ 
    userId: session.userId,
    status: { $in: ["Awaiting_Payment", "Pending_Verification", "Awaiting_Admin_Approval", "Active"] } 
  })
    .sort({ createdAt: -1 })
    .lean();

  // 3. SERIALIZATION
  const serializedUser = {
    id: dbUser._id.toString(),
    name: dbUser.name,
    legalName: dbUser.legalName || "",
    dateOfBirth: dbUser.dateOfBirth ? dbUser.dateOfBirth.toISOString() : undefined,
    idDocumentType: dbUser.idDocumentType || "GHA",
    idDocumentNumber: dbUser.idDocumentNumber || "",
    profilePicture: dbUser.profilePicture || null,
    kycStatus: dbUser.kycStatus || "Unverified",
  };

  const actualLeaseId = dbLease ? dbLease._id.toString() : "";
  const isLeaseSigned = dbLease?.signatureAudit?.isSigned || false;

  // 4. RENDER
  return (
    <VerificationDashboard 
      currentUser={serializedUser} 
      leaseId={actualLeaseId} 
      isLeaseSigned={isLeaseSigned} 
    />
  );
}