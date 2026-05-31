import { VerificationDashboard } from "@/components/verification-dashboard"
import { connectToDatabase } from "@/config/DbConnect"
import { getSession, SessionPayload } from "@/lib/session"
import User from "@/models/user"

export default async function LeasesPage() {
  
  const session = await getSession() as SessionPayload // <-- Replace with real session check
  await connectToDatabase()


  // 2. DATA FETCHING: Get the real user from MongoDB
  
  
  const dbUser = await User.findById(session.userId).select('+idDocumentNumber').lean()

  

  // 3. SERIALIZATION: Next.js cannot pass MongoDB ObjectIds or Date objects directly to Client Components
  const serializedUser = {
    id: dbUser._id.toString(),
    name: dbUser.name,
    legalName: dbUser.legalName || "",
    dateOfBirth: dbUser.dateOfBirth ? dbUser.dateOfBirth.toISOString() : undefined,
    idDocumentType: dbUser.idDocumentType || "GHA",
    idDocumentNumber: dbUser.idDocumentNumber || "",
    profilePicture: dbUser.profilePicture || null,
    kycStatus: dbUser.kycStatus || "Unverified",
  }

  // 4. RENDER: Pass the real, serialized data to the interactive client component
  return <VerificationDashboard currentUser={serializedUser} />
}