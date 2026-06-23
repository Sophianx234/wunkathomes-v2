import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/config/DbConnect";
import User from "@/models/user";
import Lease from "@/models/lease";
import Listing from "@/models/listing";
import Property from "@/models/property";
import Transaction from "@/models/transaction";
import ManageTenantsClient from "@/components/manage-tenants-client";

export const metadata = {
  title: "Manage Tenants | Admin Dashboard",
};

export default async function AdminTenantsPage() {
  const session = await getSession();
  if (!session || !['Admin', 'Manager'].includes(session.role)) {
    redirect("/login");
  }

  await connectToDatabase();

  const rawLeases = await Lease.find({})
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

  const tenantsData = await Promise.all(rawLeases.map(async (lease: any) => {
    const txs = await Transaction.find({ leaseId: lease._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const locationData = lease.listingId?.propertyId?.location;
    // Store the exact region string so we can filter by it later
    const regionName = locationData?.region || "Unknown Region";
    const locationStr = locationData ? `${locationData.area}, ${regionName}` : "Accra, Ghana";

    return {
      id: lease._id.toString(),
      user: {
        id: lease.userId._id.toString(),
        name: lease.userId.name || "Unknown Tenant",
        email: lease.userId.email || "",
        phone: lease.userId.phone || "N/A",
        profilePicture: lease.userId.profilePicture || null,
        kycStatus: lease.userId.kycStatus || "Unverified",
        ghanaCardNumber: lease.userId.idDocumentNumber || "Not Provided",
        ghanaCardUrl: lease.userId.idVerificationPhotoUrl || null,
        accountStatus: lease.userId.accountStatus || "Active",
      },
      lease: {
        id: lease._id.toString(),
        propertyName: lease.listingId?.title || "Unknown Property",
        unitNumber: lease.listingId?.features?.sizeSqm ? `${lease.listingId.features.sizeSqm} sqm` : "N/A",
        location: locationStr,
        region: regionName, // Explicitly pass the region for the filter dropdown
        propertyImage: lease.listingId?.images?.[0] || null,
        status: lease.status || "Pending",
        startDate: lease.startDate ? new Date(lease.startDate).toISOString() : new Date().toISOString(),
        endDate: lease.endDate ? new Date(lease.endDate).toISOString() : new Date().toISOString(),
        totalRentAmount: lease.totalRentAmount || 0,
        smartLockCode: lease.smartLockPin || "",
      },
      transactions: txs.map((tx: any) => ({
        id: tx._id.toString(),
        date: new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        purpose: tx.paymentPurpose || "Payment",
        amount: tx.amount || 0,
        status: tx.status || "Pending",
      }))
    };
  }));

  const validTenants = tenantsData.filter(t => t.user.id);

  // Extract unique regions and statuses dynamically directly from the fetched dataset
  const uniqueRegions = Array.from(new Set(validTenants.map(t => t.lease.region))).sort();
  const uniqueStatuses = Array.from(new Set(validTenants.map(t => t.lease.status))).sort();

  return (
    <ManageTenantsClient 
      data={validTenants} 
      availableRegions={uniqueRegions} 
      availableStatuses={uniqueStatuses} 
    />
  );
}
