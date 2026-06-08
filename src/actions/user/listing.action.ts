import { connectToDatabase } from "@/config/DbConnect";
import Listing from "@/models/listing";
import Review from "@/models/review"; // Ensure this model exists
import "@/models/property"; // Register Property schema for population
import "@/models/user"; // Register User schema for Review population

export async function getListingData(slug: string) {
  try {
    await connectToDatabase();

    // 1. Fetch the main listing securely
    const rawListing = await Listing.findOne({ slug })
      .populate("propertyId")
      .lean()
      .exec();

    if (!rawListing) {
      return { listing: null, similar: [], reviews: [] };
    }

    // 2. Fetch similar listings (same type, exclude current)
    const rawSimilar = await Listing.find({ 
      listingType: rawListing.listingType, 
      slug: { $ne: slug } 
    })
      .populate("propertyId")
      .limit(5)
      .lean()
      .exec();

    // 3. Fetch reviews
    let reviews = [];
    try {
      const rawReviews = await Review.find({ listingId: rawListing._id })
        .populate("userId", "name") 
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      reviews = rawReviews.map((r: any) => ({
        id: r._id.toString(),
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt,
        userName: r.userId?.name || "Verified Guest" 
      }));
    } catch (error) {
      console.warn("No reviews found or Review model missing.");
    }

    // =================================================================
    // 4. BULLETPROOF SERIALIZATION FOR NEXT.JS CLIENT COMPONENTS
    // =================================================================
    
    // JSON parse/stringify completely sanitizes all nested ObjectIds and Dates
    const sanitizedListing = JSON.parse(JSON.stringify(rawListing));
    
    const listing = {
      ...sanitizedListing,
      id: sanitizedListing._id, // Map alias for compatibility
      property: sanitizedListing.propertyId // Map populated object to 'property'
    };

    // 5. Serialize Similar Listings safely
    const sanitizedSimilar = JSON.parse(JSON.stringify(rawSimilar));
    
    const similar = sanitizedSimilar.map((sim: any) => ({
      ...sim,
      id: sim._id,
      property: sim.propertyId
    }));

    return { listing, similar, reviews };

  } catch (error) {
    console.error("Error fetching listing data:", error);
    return { listing: null, similar: [], reviews: [] };
  }
}