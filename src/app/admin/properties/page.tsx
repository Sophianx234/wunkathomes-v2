import PropertiesFilterBar from "@/components/properties-filter-bar";
import PropertiesGrid from "@/components/properties-grid";
import PropertiesGridSkeleton from "@/components/skeletons/properties-grid-skeleton";
import Listing from "@/models/listing";
import mongoose from "mongoose";
import Property from "@/models/property"; // Make sure to import the Property model
import { Suspense } from "react";
import { IProperty } from "@/components/property-card";
import { connectToDatabase } from "@/config/DbConnect";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  await connectToDatabase();

  const params = await searchParams;
  
  // 1. Build Property Query (for Asset Type & Location)
  const propertyQuery: Record<string, any> = {};
  let needsPropertyFetch = false;

  if (params.assetType && params.assetType !== "all") {
    propertyQuery.propertyType = params.assetType;
    needsPropertyFetch = true;
  }

  if (params.location && params.location !== "all") {
    const locStr = params.location.replace("_", " "); // "east_legon" -> "east legon"
    propertyQuery.$or = [
      { "location.area": { $regex: locStr, $options: "i" } },
      { "location.city": { $regex: locStr, $options: "i" } },
      { "location.region": { $regex: locStr, $options: "i" } },
    ];
    needsPropertyFetch = true;
  }

  // 2. Build Listing Query
  const listingQuery: Record<string, any> = {};

  // If we applied property filters, fetch matching IDs first
  if (needsPropertyFetch) {
    const matchedProperties = await Property.find(propertyQuery).select("_id").lean();
    const propertyIds = matchedProperties.map((p: any) => p._id);
    
    // If no properties match the criteria, force the listing query to return empty
    if (propertyIds.length === 0) {
      listingQuery.propertyId = { $in: [] };
    } else {
      listingQuery.propertyId = { $in: propertyIds };
    }
  }

  // 3. Strict Text Search (Title & Slug only)
  if (params.q) {
    listingQuery.$or = [
      { title: { $regex: params.q, $options: "i" } },
      { slug: { $regex: params.q, $options: "i" } },
    ];
  }

  // 4. Standard Listing Filters
  if (params.listingType && params.listingType !== "all") {
    listingQuery.listingType = params.listingType;
  }
  if (params.status && params.status !== "all") {
    listingQuery.status = params.status;
  }

  // 5. Fetch Final Results
  const rawListings = await Listing.find(listingQuery)
    .populate("propertyId")
    .sort({ createdAt: -1 })
    .lean();

  // Remap to IProperty shape and serialize securely
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
    // Property Mapping (Updated to match your nested location schema)
    property: {
      propertyType: doc.propertyId?.propertyType ?? "Unknown",
      location: {
        region: doc.propertyId?.location?.region ?? "Unknown",
        area: doc.propertyId?.location?.area ?? "Unknown",
        city: doc.propertyId?.location?.city ?? undefined,
      },
    },
  }));

  const totalAssets = await Listing.countDocuments(listingQuery);

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen bg-slate-50">
      <div className="max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        <PropertiesFilterBar totalAssets={totalAssets} />

        <Suspense fallback={<PropertiesGridSkeleton />}>
          <PropertiesGrid listings={listings} />
        </Suspense>
      </div>
    </div>
  );
}
