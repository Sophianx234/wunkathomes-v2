"use server";

import mongoose from "mongoose";
import { connectToDatabase } from "@/config/DbConnect";
import Property from "@/models/property";
import Listing from "@/models/listing";
import { IProperty } from "@/components/property-card";

export async function getPublicProperties(
  page: number = 1,
  limit: number = 12,
  filters: { type?: string; status?: string; location?: string } = {}
) {
  await connectToDatabase();

  const propertyQuery: Record<string, any> = {};
  let needsPropertyFetch = false;

  if (filters.type && filters.type !== "All" && filters.type !== "all") {
    propertyQuery.propertyType = { $regex: new RegExp(`^${filters.type}$`, "i") };
    needsPropertyFetch = true;
  }

  if (filters.location && filters.location !== "All" && filters.location !== "all") {
    const locStr = filters.location.replace("_", " ");
    propertyQuery.$or = [
      { "location.area": { $regex: locStr, $options: "i" } },
      { "location.city": { $regex: locStr, $options: "i" } },
      { "location.region": { $regex: locStr, $options: "i" } },
    ];
    needsPropertyFetch = true;
  }

  const listingQuery: Record<string, any> = {
    status: { $in: ["Available", "Pending"] },
  };

  if (filters.status && filters.status !== "All" && filters.status !== "all") {
    listingQuery.listingType = { $regex: new RegExp(`^${filters.status}$`, "i") };
  }

  if (needsPropertyFetch) {
    const matchedProperties = await Property.find(propertyQuery).select("_id").lean();
    const propertyIds = matchedProperties.map((p: any) => p._id);
    if (propertyIds.length === 0) {
      listingQuery.propertyId = { $in: [] };
    } else {
      listingQuery.propertyId = { $in: propertyIds };
    }
  }

  const skipAmount = (page - 1) * limit;

  const rawListings = await Listing.find(listingQuery)
    .populate({ path: "propertyId", model: Property })
    .sort({ createdAt: -1 })
    .skip(skipAmount)
    .limit(limit)
    .lean();

  const totalAssets = await Listing.countDocuments(listingQuery);
  const hasMore = totalAssets > skipAmount + rawListings.length;

  const inventoryData = rawListings.map((listing: any) => ({
    id: listing._id.toString(),
    slug: listing.slug,
    title: listing.title,
    price: listing.price,
    listingType: listing.listingType,
    status: listing.status,
    description: listing.description,
    features: listing.features || {},
    images: listing.images || [],
    roomType: listing.roomType,
    terms: { leaseTerm: null },
    property: {
      propertyType: listing.propertyId?.propertyType || "House",
      location: listing.propertyId?.location?.area || "Accra",
      region: listing.propertyId?.location?.region || "Greater Accra",
      landmarks: listing.propertyId?.landmarks || [],
      amenities: listing.propertyId?.generalAmenities || [],
    },
  }));

  return { properties: inventoryData, hasMore, totalAssets };
}

export async function getAdminProperties(
  page: number = 1,
  limit: number = 12,
  params: { [key: string]: string | undefined } = {}
) {
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

  const skipAmount = (page - 1) * limit;

  const rawListings = await Listing.find(listingQuery)
    .populate("propertyId")
    .sort({ createdAt: -1 })
    .skip(skipAmount)
    .limit(limit)
    .lean();

  const totalAssets = await Listing.countDocuments(listingQuery);
  const hasMore = totalAssets > skipAmount + rawListings.length;

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
    roomType: doc.roomType,
    terms: { leaseTerm: null },
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

  return { properties: listings, hasMore, totalAssets };
}
