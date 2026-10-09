import { connectToDatabase } from "@/config/DbConnect";
import Listing from "@/models/listing";
import Property from "@/models/property";
import DynamicSectionClient from "./dynamic-section-client";

export default async function AffordableRoomsSection() {
  await connectToDatabase();

  // Calculation/Filtering handled directly on the backend query!
  const rawListings = await Listing.find({
    status: { $in: ["Available", "Pending"] },
    price: { $lt: 3000 }
  })
    .populate({ path: "propertyId", model: Property })
    .sort({ createdAt: -1 })
    .lean();

  if (!rawListings || rawListings.length === 0) return null;

  const formattedProperties = rawListings.map((listing: any) => ({
    id: listing._id.toString(),
    slug: listing.slug,
    title: listing.title,
    price: listing.price,
    listingType: listing.listingType,
    roomType: listing.roomType || "Empty",
    status: listing.status,
    description: listing.description,
    features: listing.features || {},
    images: listing.images || [],
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

  return (
    <DynamicSectionClient
      title="Affordable Rooms"
      subtitle="Great spaces that won't break the bank."
      properties={formattedProperties}
      bgClass="bg-white"
    />
  );
}
