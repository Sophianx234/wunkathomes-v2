"use server";

import { connectToDatabase } from "@/config/DbConnect";
import Property from "@/models/property";
import Listing from "@/models/listing";

export async function getDynamicSearchFacets(filters: { propertyType?: string; location?: string; status?: string }) {
  await connectToDatabase();

  // Helper to build listing query based on passed filters
  const buildQuery = async (excludeField: "propertyType" | "location" | "status") => {
    const listingQuery: Record<string, any> = {
      status: { $in: ["Available", "Pending"] },
    };

    if (excludeField !== "status" && filters.status && filters.status !== "all" && filters.status !== "All") {
      listingQuery.listingType = { $regex: new RegExp(`^${filters.status}$`, "i") };
    }

    const propertyQuery: Record<string, any> = {};
    let needsPropertyFilter = false;

    if (excludeField !== "propertyType" && filters.propertyType && filters.propertyType !== "all" && filters.propertyType !== "All") {
      propertyQuery.propertyType = { $regex: new RegExp(`^${filters.propertyType}$`, "i") };
      needsPropertyFilter = true;
    }

    if (excludeField !== "location" && filters.location && filters.location !== "all" && filters.location !== "All") {
      const locStr = filters.location.replace("_", " ");
      propertyQuery.$or = [
        { "location.area": { $regex: locStr, $options: "i" } },
        { "location.city": { $regex: locStr, $options: "i" } },
        { "location.region": { $regex: locStr, $options: "i" } },
      ];
      needsPropertyFilter = true;
    }

    if (needsPropertyFilter) {
      const matchedProperties = await Property.find(propertyQuery).select("_id").lean();
      listingQuery.propertyId = { $in: matchedProperties.map((p: any) => p._id) };
    }

    return listingQuery;
  };

  // 1. Get available Property Types (exclude propertyType filter)
  const typeQuery = await buildQuery("propertyType");
  const listingsForType = await Listing.find(typeQuery).populate("propertyId", "propertyType").lean();
  const availableTypes = Array.from(new Set(listingsForType.map((l: any) => l.propertyId?.propertyType).filter(Boolean)));

  // 2. Get available Locations (exclude location filter)
  const locQuery = await buildQuery("location");
  const listingsForLoc = await Listing.find(locQuery).populate("propertyId", "location.area").lean();
  const availableAreas = Array.from(new Set(listingsForLoc.map((l: any) => l.propertyId?.location?.area).filter(Boolean)));

  // 3. Get available Statuses / Listing Types (exclude status filter)
  const statusQuery = await buildQuery("status");
  const listingsForStatus = await Listing.find(statusQuery).select("listingType").lean();
  const availableStatuses = Array.from(new Set(listingsForStatus.map((l: any) => l.listingType).filter(Boolean)));

  return {
    availableTypes: availableTypes as string[],
    availableAreas: availableAreas as string[],
    availableStatuses: availableStatuses as string[],
  };
}
