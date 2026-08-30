import { Suspense } from "react";
import { connectToDatabase } from "@/config/DbConnect";
import Tour from "@/models/tour";
import Listing from "@/models/listing";
import Property from "@/models/property";
import TourSettingsClient from "@/components/tour-settings-client";
import { getGlobalSettings } from "@/actions/admin/settings.action";
import TourTable, { TourRecord } from "@/components/tour-table"; 

export const dynamic = "force-dynamic";

async function SettingsLoader() {
  const settings = await getGlobalSettings();
  return <TourSettingsClient initialDays={settings.tourAvailableDays} initialPrice={settings.tourPrice} />;
}

function TourTableSkeleton() {
  return (
    <div className="w-full bg-white border border-zinc-200/60 rounded-lg overflow-hidden animate-[pulse_1.8s_ease-in-out_infinite]">
      <div className="h-14 border-b border-zinc-200/60 bg-slate-50/50" />
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-20 border-b border-zinc-200/60 flex items-center px-4 gap-6">
          <div className="w-14 h-14 bg-zinc-100/50 rounded-md shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-zinc-100/50 rounded w-1/3" />
            <div className="h-3 bg-zinc-100/50 rounded w-1/5" />
          </div>
          <div className="w-32 h-4 bg-zinc-100/50 rounded shrink-0 hidden md:block" />
          <div className="w-24 h-8 bg-zinc-100/50 rounded-md shrink-0" />
        </div>
      ))}
    </div>
  );
}

async function DataLoader({ page }: { page: number }) {
  await connectToDatabase();
  
  const limit = 12;
  const skipAmount = (page - 1) * limit;

  const rawTours = await Tour.find()
    .populate({
      path: "listingId",
      model: Listing,
      populate: { path: "propertyId", model: Property }
    })
    .sort({ createdAt: -1 })
    .skip(skipAmount)
    .limit(limit)
    .lean();

  const tours: TourRecord[] = rawTours.map((tour: any) => ({
    id: tour._id.toString(),
    phoneNumber: tour.phoneNumber,
    scheduledDate: tour.scheduledDate ? new Date(tour.scheduledDate).toISOString() : new Date().toISOString(),
    status: (tour.status || "Pending_Time") as any, 
    notes: tour.notes || "",
    listing: {
      id: tour.listingId?._id?.toString() || "",
      slug: tour.listingId?.slug || "",
      title: tour.listingId?.title || "Unknown Listing",
      price: tour.listingId?.price || 0,
      property: {
        propertyType: tour.listingId?.propertyId?.propertyType || "Unknown",
        location: tour.listingId?.propertyId?.location 
          ? `${tour.listingId.propertyId.location.area || ""}, ${tour.listingId.propertyId.location.region || ""}`
          : "Unknown Location",
      },
      features: {
        bedrooms: tour.listingId?.features?.bedrooms || 0,
        bathrooms: tour.listingId?.features?.bathrooms || 0,
        sizeSqm: tour.listingId?.features?.sizeSqm || 0,
      },
      image: tour.listingId?.images?.[0] || "/placeholder.jpg",
    }
  }));

  return <TourTable initialTours={tours} />;
}

export default async function TourManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams.page || "1", 10));

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <Suspense fallback={<div className="h-32 bg-zinc-100 rounded-xl mb-6 animate-pulse" />}><SettingsLoader />
        </Suspense>
        <Suspense key={currentPage} fallback={<TourTableSkeleton />}>
          <DataLoader page={currentPage} />
        </Suspense>
      </div>
    </div>
  );
}


