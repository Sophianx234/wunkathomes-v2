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

    // If not found, safely return nulls so the page can trigger notFound()
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

    // 3. Fetch reviews (Wrapped in a try/catch just in case the Review collection is empty)
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

    // 4. Serialize Main Listing (Critical for Next.js Client Components)
    const listing = {
      ...rawListing,
      _id: rawListing._id.toString(),
      id: rawListing._id.toString(), // Alias mapped for compatibility
      property: {
        ...rawListing.propertyId,
        _id: rawListing.propertyId?._id?.toString(),
      }
    };

    // 5. Serialize Similar Listings
    const similar = rawSimilar.map((sim: any) => ({
      ...sim,
      _id: sim._id.toString(),
      id: sim._id.toString(),
      property: {
        ...sim.propertyId,
        _id: sim.propertyId?._id?.toString(),
      }
    }));

    return { listing, similar, reviews };

  } catch (error) {
    console.error("Error fetching listing data:", error);
    return { listing: null, similar: [], reviews: [] };
  }
}