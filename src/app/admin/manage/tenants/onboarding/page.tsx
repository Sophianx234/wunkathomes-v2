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

  // ✅ FILTER ADDED: Remove any leases where the user's KYC status is 'Rejected'
  const filteredLeases = rawLeases.filter(
    (lease: any) => lease.userId && lease.userId.kycStatus !== 'Rejected'
  );

  // Map over the filtered array instead of the raw one
  const activationsData = await Promise.all(filteredLeases.map(async (lease: any) => {
    const txs = await Transaction.find({ leaseId: lease._id, status: 'Success' }).lean();
    const depositPaid = txs.some(tx => ['Upfront_Rent', 'Booking_Deposit'].includes(tx.paymentPurpose));

    const ghanaCardVerified = lease.userId.kycStatus === 'Verified' 
      ? "Verified" 
      : lease.userId.kycStatus === 'Unverified' ? "Not_Uploaded" : "Pending";
      
    const leaseSigned = lease.signatureAudit?.isSigned ? "Signed" : "Pending";

    let pipelineStage: "awaiting_paperwork" | "ready_for_access" | "recent" = "awaiting_paperwork";
    if (lease.status === "Active") {
      pipelineStage = "recent";
    } else if (ghanaCardVerified === "Verified" && leaseSigned === "Signed") {
      pipelineStage = "ready_for_access";
    }

    // Safely format the signature date if it exists
    const signedAtFormatted = lease.signatureAudit?.signedAt 
      ? new Date(lease.signatureAudit.signedAt).toLocaleString('en-GB', { 
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
        })
      : "Pending Signature";

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
        documentUrl: lease.documentUrl || undefined,
        totalRentAmount: lease.totalRentAmount || 0,
        signatureAudit: {
          isSigned: lease.signatureAudit?.isSigned || false,
          signedAt: signedAtFormatted,
          ipAddress: lease.signatureAudit?.ipAddress || "N/A",
          typedName: lease.signatureAudit?.typedName || lease.userId.name || "Pending",
          documentHash: lease.signatureAudit?.documentHash || "Pending Generation",
        }
      },
      checklist: {
        depositPaid,
        ghanaCardVerified,
        leaseSigned,
      },
      smartLockPin: lease.smartLockPin || undefined,
    };
  }));

  const validActivations = activationsData.filter(a => a.user.id);
  const uniqueProperties = Array.from(new Set(validActivations.map(a => a.lease.propertyName))).sort();

  return <OnboardingClient data={validActivations as any} availableProperties={uniqueProperties} />;
}