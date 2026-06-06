import PropertiesClient from "@/components/properties-client";
import { connectToDatabase } from "@/config/DbConnect";
import Listing from "@/models/listing";
import Property from "@/models/property";

export const metadata = {
  title: "Properties | WunkatHomes",
  description: "Browse our exclusive portfolio of smart homes and properties.",
};

export default async function PropertiesPage() {
  await connectToDatabase();

  // Fetch all available listings and fully populate the associated property details
  const rawListings = await Listing.find({ status: { $in: ["Available", "Pending"] } })
    .populate({ path: "propertyId", model: Property })
    .sort({ createdAt: -1 })
    .lean();

  // Map the raw MongoDB data to match the structure your client component expects
  const inventoryData = rawListings.map((listing: any) => ({
    id: listing._id.toString(),
    slug: listing.slug,
    title: listing.title,
    price: listing.price,
    listingType: listing.listingType, // "For_Rent" | "For_Sale"
    status: listing.status,
    description: listing.description,
    features: listing.features || {},
    images: listing.images || [],
    // Add the terms object here to expose the lease term to the UI
    terms: {
      leaseTerm: listing.terms?.leaseTerm ?? null,
    },
    property: {
      propertyType: listing.propertyId?.propertyType || "House",
      location: listing.propertyId?.location?.area || "Accra",
      region: listing.propertyId?.location?.region || "Greater Accra",
      landmarks: listing.propertyId?.landmarks || [],
      amenities: listing.propertyId?.generalAmenities || [],
    },
  }));

  // Dynamically extract all unique areas currently available in the database
  const availableAreas = Array.from(
    new Set(inventoryData.map((item) => item.property.location))
  ).sort();

  return <PropertiesClient inventory={inventoryData} availableAreas={availableAreas} />;
}