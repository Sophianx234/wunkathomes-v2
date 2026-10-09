import { connectToDatabase } from "@/config/DbConnect";
import Listing from "@/models/listing";
import Property from "@/models/property";
import DynamicSectionClient from "./dynamic-section-client";

export default async function PropertyTypeSections() {
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

  const propertyTypes = Array.from(new Set(formattedProperties.map(p => p.property.propertyType)));

  return (
    <>
      {propertyTypes.map((type) => {
        const matchingProperties = formattedProperties.filter(p => p.property.propertyType === type);
        if (matchingProperties.length === 0) return null;
        return (
          <DynamicSectionClient
            key={`prop-${type}`}
            title={`${type.replace(/_/g, " ")}s`}
            subtitle={`Browse our collection of beautiful ${type.replace(/_/g, " ").toLowerCase()}s ready for move-in.`}
            properties={matchingProperties}
            bgClass="bg-white"
          />
        );
      })}
    </>
  );
}
