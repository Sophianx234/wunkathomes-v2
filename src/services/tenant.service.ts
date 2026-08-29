import { connectToDatabase } from "@/config/DbConnect";
import Lease from "@/models/lease";
import User from "@/models/user";
import Listing from "@/models/listing";
import Property from "@/models/property";
import Transaction from "@/models/transaction";
import SmartLock from "@/models/smartlock";

export async function getTenantsData() {
  await connectToDatabase();

  // 1. Fetch all leases with populated relations
  const rawLeases = await Lease.find()
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

  // Filter out leases where the user's KYC was rejected (matches old onboarding logic)
  const validLeases = rawLeases.filter(
    (lease: any) => lease.userId && lease.userId.kycStatus !== 'Rejected'
  );
  
  // 2. Solve the N+1 Query Problem for Transactions
  const leaseIds = validLeases.map((l: any) => l._id);
  const allTransactions = await Transaction.find({ leaseId: { $in: leaseIds } })
    .sort({ createdAt: -1 })
    .lean();

  // Group transactions by leaseId in memory
  const transactionsByLease: Record<string, any[]> = {};
  for (const tx of allTransactions) {
    const lId = tx.leaseId.toString();
    if (!transactionsByLease[lId]) {
      transactionsByLease[lId] = [];
    }
    transactionsByLease[lId].push(tx);
  }

  // 2b. Fetch SmartLocks for these properties
  const propertyIds = validLeases.map((l: any) => l.listingId?.propertyId?._id).filter(Boolean);
  const smartLocks = await SmartLock.find({ propertyId: { $in: propertyIds } }).lean();
  
  const smartLockByPropertyId: Record<string, any> = {};
  for (const lock of smartLocks) {
    if (lock.propertyId) {
      smartLockByPropertyId[lock.propertyId.toString()] = lock;
    }
  }

  // 3. Map into a unified payload
  const unifiedData = validLeases.map((lease: any) => {
    const lId = lease._id.toString();
    const txs = transactionsByLease[lId] || [];
    
    // Get recent 5 transactions for the ledger
    const recentTxs = txs.slice(0, 5);
    
    // Calculate Checklist for Onboarding
    const successTxs = txs.filter((tx: any) => tx.status === 'Success');
    const depositPaid = successTxs.some((tx: any) => ['Upfront_Rent', 'Booking_Deposit'].includes(tx.paymentPurpose));
    
    const ghanaCardVerified = lease.userId.kycStatus === 'Verified' 
      ? "Verified" 
      : lease.userId.kycStatus === 'Unverified' ? "Not_Uploaded" : "Pending";
      
    const leaseSigned = lease.signatureAudit?.isSigned ? "Signed" : "Pending";
    
    // Determine pipeline stage (pending vs active)
    const pipelineStage = ['Awaiting_Payment', 'Pending_Verification', 'Awaiting_Admin_Approval'].includes(lease.status) 
      ? "pending" 
      : "active";

    const signedAtFormatted = lease.signatureAudit?.signedAt 
      ? new Date(lease.signatureAudit.signedAt).toLocaleString('en-GB', { 
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
        })
      : "Pending Signature";

    const locationData = lease.listingId?.propertyId?.location;
    const regionName = locationData?.region || "Unknown Region";
    const locationStr = locationData ? `${locationData.area}, ${regionName}` : "Accra, Ghana";

    const propId = lease.listingId?.propertyId?._id?.toString();
    const lock = propId ? smartLockByPropertyId[propId] : null;

    return {
      id: lId,
      pipelineStage,
      status: lease.status || "Pending",
      user: {
        id: lease.userId._id.toString(),
        name: lease.userId.name || "Unknown Tenant",
        email: lease.userId.email || "",
        phone: lease.userId.phone || "N/A",
        profilePicture: lease.userId.profilePicture || "", 
        kycStatus: lease.userId.kycStatus || "Unverified",
        ghanaCardNumber: lease.userId.idDocumentNumber || "Not Provided",
        ghanaCardUrl: lease.userId.idDocumentUrl || "", 
        securityPhotoUrl: lease.userId.idVerificationPhotoUrl || "",
        accountStatus: lease.userId.accountStatus || "Active",
      },
      lease: {
        id: lId,
        propertyName: lease.listingId?.title || "Unknown Property",
        propertyLocation: locationData?.area || "", 
        location: locationStr,
        region: regionName,
        unitNumber: lease.listingId?.features?.sizeSqm ? `${lease.listingId.features.sizeSqm} sqm` : "N/A",
        propertyImage: lease.listingId?.images?.[0] || null,
        startDate: lease.startDate ? new Date(lease.startDate).toISOString() : new Date().toISOString(),
        endDate: lease.endDate ? new Date(lease.endDate).toISOString() : new Date().toISOString(),
        documentUrl: lease.documentUrl || undefined,
        totalRentAmount: lease.totalRentAmount || 0,
        smartLockCode: lease.smartLockPin || "",
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
      transactions: recentTxs.map((tx: any) => ({
        id: tx._id.toString(),
        date: new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        purpose: tx.paymentPurpose || "Payment",
        amount: tx.amount || 0,
        status: tx.status || "Pending",
      })),
      smartLock: lock ? {
        tuyaDeviceId: lock.tuyaDeviceId,
        status: lock.status,
        batteryLevel: lock.batteryLevel,
        online: lock.status === 'online',
        activeTempPins: (lock.activeTempPins || []).map((pin: any) => ({
          pinId: pin.pinId,
          name: pin.name,
          pinMasked: pin.pinMasked,
          expiresAt: pin.expiresAt ? new Date(pin.expiresAt).toISOString() : null
        })).filter((pin: any) => pin.expiresAt && new Date(pin.expiresAt) > new Date())
      } : undefined,
      smartLockPin: lease.smartLockPin || undefined,
    };
  });

  return unifiedData;
}
