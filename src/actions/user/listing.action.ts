import { connectToDatabase } from "@/config/DbConnect";
import Listing from "@/models/listing";
import Review from "@/models/review";
import "@/models/property";
import "@/models/user";
import { z } from "zod";

// ============================================================================
// 1. STRICT INPUT VALIDATION (ZOD)
// ============================================================================
// Ensure the slug only contains lowercase letters, numbers, and hyphens
const slugSchema = z.string()
  .min(1, "Slug is required")
  .max(200, "Slug is too long")
  .regex(/^[a-z0-9-]+$/, "Invalid slug format");

// ============================================================================
// 2. SAFE SERIALIZATION UTILITY
// ============================================================================
// Explicitly map only the fields the client actually needs. This prevents
// prototype pollution and accidental data leakage of hidden DB fields.
// ============================================================================
// 2. SAFE SERIALIZATION UTILITY
// ============================================================================
const serializeListing = (doc: any) => ({
  id: doc._id.toString(),
  slug: doc.slug,
  title: doc.title,
  listingType: doc.listingType,
  price: doc.price,
  images: doc.images || doc.propertyId?.images || [], // <--- ADD THIS LINE
  // Add other explicitly required fields here...
  property: doc.propertyId ? {
    id: doc.propertyId._id.toString(),
    propertyType: doc.propertyId.propertyType,
    location: doc.propertyId.location,
  } : null,
  createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
});

// ============================================================================
// 3. MAIN FETCH FUNCTION
// ============================================================================
export async function getListingData(rawSlug: string) {
  try {
    // 1. Validate Input (NoSQL Injection Prevention)
    const { success, data: slug, error } = slugSchema.safeParse(rawSlug);
    if (!success) {
      console.warn(`[SECURITY] Invalid slug attempt: ${rawSlug}`, error.message);
      return { listing: null, similar: [], reviews: [] };
    }

    await connectToDatabase();

    // 2. Fetch the main listing securely
    const rawListing = await Listing.findOne({ slug })
      .populate("propertyId")
      .lean()
      .exec();

    if (!rawListing) {
      return { listing: null, similar: [], reviews: [] };
    }

    // 3. Parallelize subsequent queries for maximum performance
    // Promise.all cuts the waiting time in half since they run concurrently
    const [rawSimilar, rawReviews] = await Promise.all([
      Listing.find({ 
        listingType: rawListing.listingType, 
        slug: { $ne: slug } 
      })
      .populate("propertyId")
      .limit(5)
      .lean()
      .exec(),
      
      Review.find({ listingId: rawListing._id })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .lean()
      .exec()
      .catch(() => []) // Catch review failures silently without breaking the page
    ]);

    // 4. Safely serialize all data
    const listing = serializeListing(rawListing);
    const similar = rawSimilar.map(serializeListing);
    
    const reviews = rawReviews.map((r: any) => ({
      id: r._id.toString(),
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt ? new Date(r.createdAt).toISOString() : null,
      userName: r.userId?.name || "Verified Guest" 
    }));

    return { listing, similar, reviews };

  } catch (error: any) {
    // 5. Fail Securely
    console.error(`[SYSTEM LOG] Error fetching listing data for slug (${rawSlug}):`, error.message);
    return { listing: null, similar: [], reviews: [] };
  }
}