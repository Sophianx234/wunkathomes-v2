import { VerificationDashboard } from "@/components/verification-dashboard"
import { connectToDatabase } from "@/config/DbConnect"
import { getSession, SessionPayload } from "@/lib/session"
import User from "@/models/user"
import Lease from "@/models/lease" // ✅ Add this import

export default async function LeasesPage() {
  const session = await getSession() as SessionPayload;
  await connectToDatabase();

  // 1. DATA FETCHING: Get the real user
  const dbUser = await User.findById(session.userId).select('+idDocumentNumber').lean();

  // 2. DATA FETCHING: Get the user's active/pending lease
  // Adjust the query field ('tenant', 'userId', etc.) based on your Lease schema
  const dbLease = await Lease.findOne({ tenant: session.userId })
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

  // Extract the real 24-character hex string
  const actualLeaseId = dbLease ? dbLease._id.toString() : "";

  // 4. RENDER
  // ✅ Pass the real leaseId to the dashboard
  return <VerificationDashboard currentUser={serializedUser} leaseId={actualLeaseId} />
}