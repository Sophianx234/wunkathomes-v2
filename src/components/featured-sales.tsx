import { connectToDatabase } from "@/config/DbConnect";
import Listing from "@/models/listing";
import Property from "@/models/property";
import FeaturedSalesClient from "./featured-sales-client";
export default async function FeaturedSales() {
    await connectToDatabase();

    // Fetch exclusively "For_Sale" listings that are Available or Pending
    const rawListings = await Listing.find({ 
      listingType: "For_Sale",
      status: { $in: ["Available", "Pending"] }
    })
      .populate({ path: "propertyId", model: Property })
      .sort({ createdAt: -1 })
      .lean();

    // Format the MongoDB data to perfectly match your PropertyCard interface
    const formattedProperties = rawListings.map((listing: any) => ({
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

    // Pass the real data to the client component
  
    return <FeaturedSalesClient properties={formattedProperties} />;
  }
