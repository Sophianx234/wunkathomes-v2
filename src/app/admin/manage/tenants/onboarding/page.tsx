import OnboardingClient from "@/components/onboarding-client";
import { connectToDatabase } from "@/config/DbConnect";
import { getSession } from "@/lib/session";
import Lease from "@/models/lease";
import Listing from "@/models/listing";
import Property from "@/models/property";
import Transaction from "@/models/transaction";
import User from "@/models/user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Lease Activations | Admin Dashboard",
};

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session || !['Admin', 'Manager'].includes(session.role)) {
    redirect("/login");
  }

  await connectToDatabase();

  // Fetch leases that are currently in the onboarding pipeline or recently active
  const rawLeases = await Lease.find({
    status: { $in: ['Awaiting_Payment', 'Pending_Verification', 'Awaiting_Admin_Approval', 'Active'] }
  })
    .populate({ 
      path: 'userId', 
      model: User,
      select: '+idDocumentNumber +idVerificationPhotoUrl' 
    })
    .populate({
      path: 'listingId',
      model: Listing,
      populate: { path: 'propertyId', model: Property }
    })
    .select('+smartLockPin')
    .sort({ createdAt: -1 })
    .lean();

  const activationsData = await Promise.all(rawLeases.map(async (lease: any) => {
    // Check if a deposit has been successfully paid
    const txs = await Transaction.find({ leaseId: lease._id, status: 'Success' }).lean();
    const depositPaid = txs.some(tx => ['Upfront_Rent', 'Booking_Deposit'].includes(tx.paymentPurpose));

    // Calculate Checklist statuses
    const ghanaCardVerified = lease.userId.kycStatus === 'Verified' 
      ? "Verified" 
      : lease.userId.kycStatus === 'Unverified' ? "Not_Uploaded" : "Pending";
      
    const leaseSigned = lease.signatureAudit?.isSigned ? "Signed" : "Pending";

    // Determine Pipeline Stage
    let pipelineStage: "awaiting_paperwork" | "ready_for_access" | "recent" = "awaiting_paperwork";
    if (lease.status === "Active") {
      pipelineStage = "recent";
    } else if (ghanaCardVerified === "Verified" && leaseSigned === "Signed") {
      pipelineStage = "ready_for_access";
    }

    return {
      id: lease._id.toString(),
      pipelineStage,
      user: {
        id: lease.userId._id.toString(),
        name: lease.userId.name || "Unknown Tenant",
        email: lease.userId.email || "",
        phone: lease.userId.phone || "N/A",
        profilePicture: lease.userId.profilePicture || null,
        ghanaCardNumber: lease.userId.idDocumentNumber || "Not Provided",
        ghanaCardUrl: lease.userId.idVerificationPhotoUrl || null,
      },
      lease: {
        id: lease._id.toString(),
        propertyName: lease.listingId?.title || "Unknown Property",
        unitNumber: lease.listingId?.features?.sizeSqm ? `${lease.listingId.features.sizeSqm} sqm` : "N/A",
        startDate: lease.startDate ? new Date(lease.startDate).toISOString() : new Date().toISOString(),
      },
      checklist: {
        depositPaid,
        ghanaCardVerified,
        leaseSigned,
      },
      smartLockPin: lease.smartLockPin || undefined,
    };
  }));

  // Filter out any broken records
  const validActivations = activationsData.filter(a => a.user.id);
  
  // Extract unique properties for the dynamic filter dropdown
  const uniqueProperties = Array.from(new Set(validActivations.map(a => a.lease.propertyName))).sort();

  return <OnboardingClient data={validActivations as any} availableProperties={uniqueProperties} />;
}