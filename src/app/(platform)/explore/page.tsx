import ExploreClientLayout from "@/components/explore-client";
import { connectToDatabase } from "@/config/DbConnect";
import Listing from "@/models/listing";
import Property from "@/models/property";

export const metadata = {
  title: "Explore Portfolio | WunkatHomes",
  description: "Discover curated smart homes, luxury rentals, and premium estates.",
};

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function ExplorePage({ searchParams }: PageProps) {
  await connectToDatabase();

  const resolvedParams = await searchParams;
  const currentMode = resolvedParams.status?.toLowerCase() === "sale" ? "sale" : "rent";
  const databaseType = currentMode === "sale" ? "For_Sale" : "For_Rent";

  // Fetch the top 4 live highlight listings from the database matching the active mode
  const rawHighlights = await Listing.find({
    listingType: databaseType,
    status: { $in: ["Available", "Pending"] },
  })
    .populate({ path: "propertyId", model: Property })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  // Format database entries cleanly for your PropertyCard
  const liveHighlights = rawHighlights.map((listing: any) => ({
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

  return (
    <ExploreClientLayout 
      mode={currentMode} 
      highlights={liveHighlights} 
    />
  );
}
