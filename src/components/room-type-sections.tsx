import { connectToDatabase } from "@/config/DbConnect";
import Listing from "@/models/listing";
import Property from "@/models/property";
import DynamicSectionClient from "./dynamic-section-client";

export default async function RoomTypeSections() {
  await connectToDatabase();

  const rawListings = await Listing.find({
    status: { $in: ["Available", "Pending"] },
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

  const roomTypes = Array.from(new Set(formattedProperties.map(p => p.roomType)));

  return (
    <>
      {roomTypes.map((type) => {
        const matchingProperties = formattedProperties.filter(p => p.roomType === type);
        if (matchingProperties.length === 0) return null;
        return (
          <DynamicSectionClient
            key={`room-${type}`}
            title={`${type} Rooms`}
            subtitle={`Find the perfect ${type.toLowerCase()} room tailored to your needs.`}
            properties={matchingProperties}
            bgClass="bg-zinc-50"
          />
        );
      })}
    </>
  );
}
