import { getSession } from "@/lib/session";
import { connectToDatabase } from "@/config/DbConnect";
import User from "@/models/user";
import Lease from "@/models/lease";
import SavedProperty from "@/models/saved"; 
import NavbarClient from "./nav-client";

// 1. Define the impure time calculation OUTSIDE the React component
const getTwentyFourHoursAgo = () => {
  return new Date(Date.now() - 24 * 60 * 60 * 1000);
};

export default async function Navbar() {
  const session = await getSession();
  let userData = null;

  if (session?.userId) {
    await connectToDatabase();
    
    const dbUser = await User.findById(session.userId)
      .select("name email profilePicture kycStatus")
      .lean();

    if (dbUser) {
      // Extract these boolean variables to determine if "Verify Identity" should be shown
      const hasPaidProperty = await Lease.exists({ userId: session.userId }); // Checks if user has a lease/transaction
      const verificationStatus = dbUser.kycStatus || "Unverified";
      
      let signaturePending = false;
      if (verificationStatus === "Approved") {
        const unsignedLease = await Lease.exists({
          userId: session.userId,
          status: { $in: ["Pending_Verification", "Awaiting_Admin_Approval", "Active"] },
          "signatureAudit.isSigned": false,
        });
        signaturePending = !!unsignedLease;
      }

      // 2. Call the helper function here
      const twentyFourHoursAgo = getTwentyFourHoursAgo();
      
      const recentSaves = await SavedProperty.exists({
        user: session.userId,
        createdAt: { $gte: twentyFourHoursAgo }
      });
      const newSaved = !!recentSaves;

      userData = {
        name: dbUser.name || "User",
        email: dbUser.email || "",
        profilePicture: dbUser.profilePicture || (dbUser as any).avatar || null,
        indicators: {
          hasPaidProperty: !!hasPaidProperty,
          verificationStatus,
          signaturePending,
          newSaved,
        },
      };
    }
  }

  return <NavbarClient user={userData as any} />;
}
