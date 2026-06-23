import PropertiesFilterBar from "@/components/properties-filter-bar";
import PropertiesGrid from "@/components/properties-grid";
import Listing from "@/models/listing";
import mongoose from "mongoose";
import Property from "@/models/property";
import { Suspense } from "react";
import { IProperty } from "@/components/property-card";
import { connectToDatabase } from "@/config/DbConnect";

export const dynamic = "force-dynamic";

function PropertiesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col bg-white border border-slate-100 rounded-lg overflow-hidden animate-[pulse_1.8s_ease-in-out_infinite]">
          <div className="w-full h-56 bg-slate-100" />
          <div className="p-4 space-y-4 border-t border-slate-50">
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="flex justify-between pt-2">
              <div className="h-4 bg-slate-100 rounded w-1/4" />
              <div className="h-4 bg-slate-100 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function DataLoader({ 
  params, 
  page 
}: { 
  params: { [key: string]: string | undefined }; 
  page: number 
}) {
  await connectToDatabase();
  
  const propertyQuery: Record<string, any> = {};
  let needsPropertyFetch = false;

  if (params.assetType && params.assetType !== "all") {
    propertyQuery.propertyType = params.assetType;
    needsPropertyFetch = true;
  }

  if (params.location && params.location !== "all") {
    const locStr = params.location.replace("_", " ");
    propertyQuery.$or = [
      { "location.area": { $regex: locStr, $options: "i" } },
      { "location.city": { $regex: locStr, $options: "i" } },
      { "location.region": { $regex: locStr, $options: "i" } },
    ];
    needsPropertyFetch = true;
  }

  const listingQuery: Record<string, any> = {};

  if (needsPropertyFetch) {
    const matchedProperties = await Property.find(propertyQuery).select("_id").lean();
    const propertyIds = matchedProperties.map((p: any) => p._id);
    if (propertyIds.length === 0) {
      listingQuery.propertyId = { $in: [] };
    } else {
      listingQuery.propertyId = { $in: propertyIds };
    }
  }

  if (params.q) {
    listingQuery.$or = [
      { title: { $regex: params.q, $options: "i" } },
      { slug: { $regex: params.q, $options: "i" } },
    ];
  }

  if (params.listingType && params.listingType !== "all") {
    listingQuery.listingType = params.listingType;
  }
  if (params.status && params.status !== "all") {
    listingQuery.status = params.status;
  }

  const limit = 12;
  const skipAmount = (page - 1) * limit;

  const rawListings = await Listing.find(listingQuery)
    .populate("propertyId")
    .sort({ createdAt: -1 })
    .skip(skipAmount)
    .limit(limit)
    .lean();

  const totalAssets = await Listing.countDocuments(listingQuery);

  const listings: IProperty[] = rawListings.map((doc: any) => ({
    id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    price: doc.price,
    listingType: doc.listingType,
    status: doc.status,
    features: {
      bedrooms: doc.features?.bedrooms ?? 0,
      bathrooms: doc.features?.bathrooms ?? 0,
      sizeSqm: doc.features?.sizeSqm ?? 0,
    },
    terms: {
      leaseTerm: doc.terms?.leaseTerm ?? null,
    },
    smartLock: {
      hasSmartLock: doc.smartLock?.hasSmartLock ?? false,
    },
    images: doc.images ?? [],
    property: {
      propertyType: doc.propertyId?.propertyType ?? "Unknown",
      location: {
        region: doc.propertyId?.location?.region ?? "Unknown",
        area: doc.propertyId?.location?.area ?? "Unknown",
        city: doc.propertyId?.location?.city ?? undefined,
      },
    },
  }));

  return (
    <>
      <PropertiesFilterBar totalAssets={totalAssets} />
      <PropertiesGrid listings={listings} />
    </>
  );
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams.page || "1", 10));

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen bg-slate-50">
      <div className="max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        <Suspense key={currentPage} fallback={
          <>
            <PropertiesFilterBar totalAssets={0} />
            <PropertiesGridSkeleton />
          </>
        }>
          <DataLoader params={resolvedParams} page={currentPage} />
        </Suspense>
      </div>
    </div>
  );
}
