import { Suspense } from "react";
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

export const dynamic = "force-dynamic";

function TenantsSkeleton() {
  return (
    <div className="w-full bg-white border border-slate-100 rounded-lg overflow-hidden animate-[pulse_1.8s_ease-in-out_infinite]">
      <div className="h-14 border-b border-slate-100 bg-slate-50/50" />
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-20 border-b border-slate-100 flex items-center px-4 gap-6">
          <div className="w-12 h-12 bg-slate-100 rounded-full shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-slate-100 rounded w-1/3" />
            <div className="h-3 bg-slate-100 rounded w-1/4" />
          </div>
          <div className="w-32 h-4 bg-slate-100 rounded shrink-0 hidden md:block" />
          <div className="w-24 h-6 bg-slate-100 rounded-md shrink-0" />
          <div className="w-16 h-8 bg-slate-100 rounded-md shrink-0" />
        </div>
      ))}
    </div>
  );
}

async function DataLoader({ page }: { page: number }) {
  await connectToDatabase();

  const limit = 10;
  const skipAmount = (page - 1) * limit;

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
    .skip(skipAmount)
    .limit(limit)
    .lean();

  const tenantsData = await Promise.all(rawLeases.map(async (lease: any) => {
    const txs = await Transaction.find({ leaseId: lease._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const locationData = lease.listingId?.propertyId?.location;
    const regionName = locationData?.region || "Unknown Region";
    const locationStr = locationData ? `${locationData.area}, ${regionName}` : "Accra, Ghana";

    return {
      id: lease._id.toString(),
      user: {
        id: lease.userId?._id?.toString() || "",
        name: lease.userId?.name || "Unknown Tenant",
        email: lease.userId?.email || "",
        phone: lease.userId?.phone || "N/A",
        profilePicture: lease.userId?.profilePicture || null,
        kycStatus: lease.userId?.kycStatus || "Unverified",
        ghanaCardNumber: lease.userId?.idDocumentNumber || "Not Provided",
        ghanaCardUrl: lease.userId?.idVerificationPhotoUrl || null,
        accountStatus: lease.userId?.accountStatus || "Active",
      },
      lease: {
        id: lease._id.toString(),
        propertyName: lease.listingId?.title || "Unknown Property",
        unitNumber: lease.listingId?.features?.sizeSqm ? `${lease.listingId.features.sizeSqm} sqm` : "N/A",
        location: locationStr,
        region: regionName,
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

  // Still compute unique regions/statuses for the current chunk (or hardcode them if prefered)
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

export default async function AdminTenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getSession();
  if (!session || !['Admin', 'Manager'].includes(session.role)) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams.page || "1", 10));

  return (
    <Suspense key={currentPage} fallback={
      <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
        <div className="max-w-[1400px] mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200/60 pb-4">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Tenant Directory
            </h1>
          </div>
          <TenantsSkeleton />
        </div>
      </div>
    }>
      <DataLoader page={currentPage} />
    </Suspense>
  );
}
