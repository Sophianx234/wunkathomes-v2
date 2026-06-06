import { connectToDatabase } from "@/config/DbConnect";
import Listing from "@/models/listing";
import Property from "@/models/property";
import FeaturedRentalsClient from "./featured-rentals-client";

export default async function FeaturedRentals() {
  await connectToDatabase();

  // Fetch only "For_Rent" listings that are currently available
  const rawRentals = await Listing.find({ 
    listingType: "For_Rent",
    status: { $in: ["Available", "Pending"] }
  })
    .populate({ path: "propertyId", model: Property })
    .sort({ createdAt: -1 })
    .lean();

  // Format the data to match the structure your PropertyCard expects
  const formattedRentals = rawRentals.map((listing: any) => ({
    id: listing._id.toString(),
    slug: listing.slug,
    title: listing.title,
    price: listing.price,
    listingType: listing.listingType,
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

  return <FeaturedRentalsClient properties={formattedRentals} />;
}