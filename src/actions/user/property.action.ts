"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import mongoose from "mongoose";

import { connectToDatabase } from "@/config/DbConnect";
import Property from "@/models/property";
import Listing from "@/models/listing";
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary"; 
import { getSession } from "@/lib/session";

// NOTE: In production, import your actual Upstash Redis ratelimit instance
// import { ratelimit } from "@/lib/redis";

export type ActionState = {
  success: boolean;
  message: string;
  error?: string;
};

// ============================================================================
// 1. STRICT INPUT VALIDATION SCHEMAS (ZOD)
// ============================================================================
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const createPropertySchema = z.object({
  title: z.string().trim().min(5, "Title is too short").max(100).regex(/^[^<>]+$/, "Invalid characters detected"),
  listingType: z.enum(["For_Rent", "For_Sale"]),
  status: z.enum(["Available", "Pending", "Rented", "Sold"]).default("Available"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  description: z.string().trim().min(20, "Description too short").max(5000),
  leaseTerm: z.string().trim().max(50).optional().nullable(),
  
  bedrooms: z.coerce.number().min(0).max(50).default(0),
  bathrooms: z.coerce.number().min(0).max(50).default(0),
  sizeSqm: z.coerce.number().min(0).optional(),
  
  propertyType: z.enum(["Apartment_Building", "Commercial", "House", "Land"]),
  region: z.string().trim().min(2).max(50),
  city: z.string().trim().max(50).optional().nullable(),
  area: z.string().trim().min(2).max(100),
  
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  
  amenities: z.array(z.string().trim().max(50)).max(50),
  landmarks: z.array(z.string().trim().max(100)).max(20).optional(),
  
  hasSmartLock: z.boolean().default(false),
  accessInstructions: z.string().trim().max(1000).optional().nullable(),

  mediaUrls: z.array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required")
    .max(10, "Maximum of 10 images allowed"),
    
});

// Edit Schema drops media requirement and adds secure JSON parsing for retained images
// Add .omit({ mediaUrls: true }) before .extend()
const editPropertySchema = createPropertySchema
  .omit({ mediaUrls: true }) 
  .extend({
    listingId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Listing ID"),
    
    // Parse the existing images safely
    retainedImages: z.preprocess((val) => {
      if (typeof val === "string") {
        try { return JSON.parse(val); } catch { return []; }
      }
      return [];
    }, z.array(z.string().url("Invalid image URL")).max(10)),
    
    // Accept the new images (optional, because they might just be editing text)
    newMediaUrls: z.array(z.string().url()).optional().default([]),
  });

const deleteSchema = z.object({
  listingId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Listing ID"),
});

// Helper
function extractPublicId(url: string) {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const folder = parts[parts.length - 2];
  return `${folder}/${filename.split('.')[0]}`; 
}

// ============================================================================
// 2. SERVER ACTIONS
// ============================================================================

// --- 1. CREATE ACTION ---
export async function createPropertyAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  let ip = "unknown";
  let userId = "unknown";

  try {
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for")?.split(',')[0] || "Unknown IP";

    const session = await getSession();
    if (!session || !['Admin', 'Manager'].includes(session.role)) throw new Error("UNAUTHORIZED");
    userId = session.userId;

    // const { success } = await ratelimit.limit(`create_prop_${userId}`);
    // if (!success) throw new Error("RATE_LIMIT_EXCEEDED");

    const landmarksStr = formData.get("landmarks") as string | null;
    const rawData = {
      title: formData.get("title"),
      listingType: formData.get("listingType"),
      propertyType: formData.get("propertyType"),
      description: formData.get("description"),
      price: formData.get("price"),
      leaseTerm: formData.get("leaseTerm"),
      status: formData.get("status") || "Available",
      bedrooms: formData.get("bedrooms"),
      bathrooms: formData.get("bathrooms"),
      sizeSqm: formData.get("sizeSqm") || undefined, 
      region: formData.get("region"),
      city: formData.get("city"),
      area: formData.get("area"),
      lat: formData.get("lat"),
      lng: formData.get("lng"),
      amenities: formData.getAll("amenities"),
      landmarks: landmarksStr ? landmarksStr.split(",").map(item => item.trim()).filter(Boolean) : [],
      hasSmartLock: formData.get("hasSmartLock") === "on" || formData.get("hasSmartLock") === "true",
      accessInstructions: formData.get("accessInstructions"),
      
      // 1. THIS IS THE KEY CHANGE: Grab the URLs instead of Files
      mediaUrls: formData.getAll("mediaUrls"), 
    };

    const validData = createPropertySchema.parse(rawData);

    await connectToDatabase();
    
    // Mongoose recommended transaction pattern
    const dbSession = await mongoose.startSession();
    await dbSession.withTransaction(async () => {
      const newProperty = await Property.create([{
        propertyType: validData.propertyType,
        location: { region: validData.region, area: validData.area, city: validData.city || undefined },
        coordinates: { lat: validData.lat, lng: validData.lng },
        landmarks: validData.landmarks,
        generalAmenities: validData.amenities,
      }], { session: dbSession });

      await Listing.create([{
        propertyId: newProperty[0]._id,
        listingType: validData.listingType,
        status: validData.status,
        price: validData.price,
        title: validData.title,
        description: validData.description,
        features: { bedrooms: validData.bedrooms, bathrooms: validData.bathrooms, sizeSqm: validData.sizeSqm },
        terms: { leaseTerm: validData.leaseTerm || undefined },
        smartLock: { hasSmartLock: validData.hasSmartLock, accessInstructions: validData.accessInstructions },
        
        // 2. PASS THE URLS DIRECTLY TO MONGO
        images: validData.mediaUrls, 
      }], { session: dbSession });
    });
    await dbSession.endSession();

    revalidatePath("/");
    revalidatePath("/admin/properties");

    return { success: true, message: "Property created successfully." };
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return { success: false, message: "Unauthorized", error: "Unauthorized" };
    if (error.message === "RATE_LIMIT_EXCEEDED") return { success: false, message: "Too many requests.", error: "Please wait." };
    
    // Intercept Zod Validation Errors safely
    if (error instanceof z.ZodError) {
      const validationErrors = error.issues.map(issue => `${issue.path[0]}: ${issue.message}`).join(', ');
      console.warn(`[VALIDATION FAILED]`, validationErrors);
      return { success: false, message: `Validation failed: ${validationErrors}`, error: validationErrors };
    }

    // Catch standard errors and MongoDB errors
    console.error(`[SECURITY LOG] Property Action Error (User: ${userId}, IP: ${ip}):`, error);
    return { success: false, message: error?.message || "System error occurred.", error: "System error occurred." };
  }
}

// --- 2. EDIT ACTION ---
export async function editPropertyAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  let ip = "unknown";
  let userId = "unknown";

  try {
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for")?.split(',')[0] || "Unknown IP";

    const session = await getSession();
    if (!session || !['Admin', 'Manager'].includes(session.role)) throw new Error("UNAUTHORIZED");
    userId = session.userId;


    const landmarksStr = formData.get("landmarks") as string | null;
    const rawData = {
      listingId: formData.get("listingId"),
      retainedImages: formData.get("existingImages"), 
      title: formData.get("title"),
      listingType: formData.get("listingType"),
      propertyType: formData.get("propertyType"),
      description: formData.get("description"),
      price: formData.get("price"),
      leaseTerm: formData.get("leaseTerm"),
      status: formData.get("status") || "Available",
      bedrooms: formData.get("bedrooms"),
      bathrooms: formData.get("bathrooms"),
      sizeSqm: formData.get("sizeSqm") || undefined,
      region: formData.get("region"),
      city: formData.get("city"),
      area: formData.get("area"),
      lat: formData.get("lat"),
      lng: formData.get("lng"),
      amenities: formData.getAll("amenities"),
      landmarks: landmarksStr ? landmarksStr.split(",").map(item => item.trim()).filter(Boolean) : [],
      hasSmartLock: formData.get("hasSmartLock") === "on" || formData.get("hasSmartLock") === "true",
      
      // Look for the lightweight strings, not files
      newMediaUrls: formData.getAll("newMediaUrls"), 
    };

    const validData = editPropertySchema.parse(rawData);

    await connectToDatabase();

    const oldListing = await Listing.findById(validData.listingId);
    if (!oldListing) return { success: false, message: "Listing not found", error: "Listing not found" };
    
    const targetPropertyId = oldListing.propertyId;

    // Diff to find images that were completely removed by the user
    const imagesToDeleteFromCloudinary = oldListing.images.filter((img: string) => !validData.retainedImages.includes(img));

    // Combine old images kept + new images uploaded directly from browser
    const finalImageUrls = [...validData.retainedImages, ...validData.newMediaUrls];

    const dbSession = await mongoose.startSession();
    await dbSession.withTransaction(async () => {
      await Property.findByIdAndUpdate(targetPropertyId, {
        propertyType: validData.propertyType,
        location: { region: validData.region, area: validData.area, city: validData.city || undefined },
        coordinates: { lat: validData.lat, lng: validData.lng },
        landmarks: validData.landmarks,
        generalAmenities: validData.amenities,
      }, { session: dbSession });

      await Listing.findByIdAndUpdate(validData.listingId, {
        listingType: validData.listingType,
        status: validData.status,
        price: validData.price,
        title: validData.title,
        description: validData.description,
        features: { bedrooms: validData.bedrooms, bathrooms: validData.bathrooms, sizeSqm: validData.sizeSqm },
        terms: { leaseTerm: validData.leaseTerm || undefined },
        smartLock: { hasSmartLock: validData.hasSmartLock, accessInstructions: validData.accessInstructions },
        images: finalImageUrls, // <-- Directly save the text arrays
      }, { session: dbSession });
    });
    await dbSession.endSession();

    // Still delete orphaned images securely from the server
    for (const oldUrl of imagesToDeleteFromCloudinary) {
      const publicId = extractPublicId(oldUrl);
      deleteFromCloudinary(publicId).catch(err => console.error("Cloudinary cleanup failed:", err));
    }

    revalidatePath("/admin/properties");
    return { success: true, message: "Property updated successfully." };
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return { success: false, message: "Unauthorized", error: "Unauthorized" };
    
    if (error instanceof z.ZodError) {
      const validationErrors = error.issues.map(issue => `${issue.path[0]}: ${issue.message}`).join(', ');
      console.warn(`[VALIDATION FAILED]`, validationErrors);
      return { success: false, message: `Validation failed: ${validationErrors}`, error: validationErrors };
    }

    console.error(`[SECURITY LOG] Edit Property Error (User: ${userId}, IP: ${ip}):`, error);
    return { success: false, message: "System error", error: "System error" };
  }
}

// --- 3. DELETE ACTION ---
export async function deletePropertyAction(rawListingId: string) {
  let ip = "unknown";
  let userId = "unknown";

  try {
    const headersList = await headers();
    ip = headersList.get("x-forwarded-for")?.split(',')[0] || "Unknown IP";

    const session = await getSession();
    if (!session || !['Admin', 'Manager'].includes(session.role)) throw new Error("UNAUTHORIZED");
    userId = session.userId;

    // const { success } = await ratelimit.limit(`delete_prop_${userId}`);
    // if (!success) throw new Error("RATE_LIMIT_EXCEEDED");

    const { listingId } = deleteSchema.parse({ listingId: rawListingId });
    
    await connectToDatabase();
    
    const listing = await Listing.findById(listingId);
    if (!listing) return { success: false, message: "Asset not found." };

    const propertyId = listing.propertyId;
    const imagesToDelete = listing.images; 

    const dbSession = await mongoose.startSession();
    await dbSession.withTransaction(async () => {
      await Listing.findByIdAndDelete(listingId, { session: dbSession });
      if (propertyId) await Property.findByIdAndDelete(propertyId, { session: dbSession });
    });
    await dbSession.endSession();

    // Cleanup external assets
    for (const imgUrl of imagesToDelete) {
      const publicId = extractPublicId(imgUrl);
      deleteFromCloudinary(publicId).catch(err => console.error("Cloudinary cleanup failed:", err));
    }

    revalidatePath("/admin/properties");
    return { success: true, message: "Asset and related data deleted successfully." };

  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return { success: false, message: "Unauthorized. Admin access required." }; 
    console.error(`[SECURITY LOG] Delete Property Error (User: ${userId}, IP: ${ip}):`, error.message);
    return { success: false, message: "System error occurred during deletion." };
  }
}
