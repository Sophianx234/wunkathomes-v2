"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Auth and DB imports
// import { auth } from "@/lib/auth"; 

import mongoose from "mongoose";
import { connectToDatabase } from "@/config/DbConnect";
import Property from "@/models/property";
import Listing from "@/models/listing";
import { uploadToCloudinary } from "@/lib/cloudinary";

// --- Rate Limiter Configuration (Production-Ready) ---
const redis = Redis.fromEnv();

// Different rate limits for different severity actions
const createPropertyRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"), // 5 property creations per 10 minutes
  analytics: true,
  prefix: "ratelimit:create_property",
});

// --- 1. Zod Validation Schemas ---

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const createPropertySchema = z.object({
  // Listing Schema Fields
  title: z.string().trim().min(5, "Title is too short").max(100, "Title is too long").regex(/^[^<>]+$/, "Invalid characters detected"),
  listingType: z.enum(["For_Rent", "For_Sale"]),
  status: z.enum(["Available", "Pending", "Rented", "Sold"]).default("Available"),
  price: z.coerce.number().positive("Price must be greater than 0").max(1000000000, "Price exceeds maximum allowed"),
  description: z.string().trim().min(20, "Description too short").max(5000, "Description exceeds 5000 characters").regex(/^[^<>]+$/, "Invalid characters detected"),
  leaseTerm: z.string().trim().max(50).optional().nullable(),
  
  // NEW: Features
  bedrooms: z.coerce.number().min(0, "Bedrooms cannot be negative").default(0),
  bathrooms: z.coerce.number().min(0, "Bathrooms cannot be negative").default(0),
  sizeSqm: z.coerce.number().min(0, "Size cannot be negative").optional(),
  
  // Property Schema Fields
  propertyType: z.enum(["Apartment_Building", "Commercial", "House", "Land"]),
  region: z.string().trim().min(2).max(50),
  city: z.string().trim().max(50).optional().nullable(),
  area: z.string().trim().min(2).max(100),
  
  // Coordinates validation (Ghana bounds roughly: Lat 4.5 to 11.5, Lng -3.5 to 1.5)
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  
  // Arrays and Booleans
  amenities: z.array(z.string().trim().max(50)).max(50, "Too many amenities"),
  landmarks: z.array(z.string().trim().max(100)).max(20, "Too many landmarks").optional(), // NEW: Landmarks array
  
  // Smart Lock Sub-document
  hasSmartLock: z.boolean().default(false),
  accessInstructions: z.string().trim().max(1000).optional().nullable(),

  // File Validation
  media: z.array(
      z.instanceof(File)
        .refine((file) => file.size <= MAX_FILE_SIZE, "Max file size is 5MB.")
        .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), "Only .jpg, .jpeg, .png and .webp formats are supported.")
    )
    .min(1, "At least one image is required")
    .max(10, "Maximum of 10 images allowed"),
});

export type ActionState = {
  success: boolean;
  message: string;
  error?: string;
};

export async function createPropertyAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    // --- 2. Authentication Check (A07: Identification and Authentication Failures) ---
    // Do this BEFORE rate limiting to avoid wasting rate limit quota on unauthenticated requests
/*     const session = await auth();
    
    if (!session?.user) {
      console.warn("Unauthorized property creation attempt.");
      return { error: "Unauthorized" };
    }

    // --- 3. Rate Limiting (A04: Insecure Design) ---
    // Use authenticated user ID for rate limiting
    const identifier = session.user.id;
    const { success: rateLimitSuccess, limit, reset, remaining } = await createPropertyRateLimit.limit(identifier);
    
    if (!rateLimitSuccess) {
      // ... logging ...
      const resetTime = new Date(reset).toLocaleTimeString();
      return { 
        error: `Too many property creation requests. Please try again after ${resetTime}.`,
        resetAt: reset,
      };
    }

    // --- 4. Authorization Check (A01: Broken Access Control) ---
    if (session.user.role !== "Admin" && session.user.role !== "Manager") {
      // ... logging ...
      return { error: "Forbidden: Insufficient privileges" };
    }
 */
 
    // --- Parse and format the landmarks array string safely ---
    const landmarksStr = formData.get("landmarks") as string | null;
    const landmarksArray = landmarksStr 
      ? landmarksStr.split(",").map(item => item.trim()).filter(Boolean)
      : [];

    // --- 5. Data Extraction & Zod Parsing (A03: Injection & A08: Data Integrity) ---
    const rawData = {
      title: formData.get("title"),
      listingType: formData.get("listingType"),
      propertyType: formData.get("propertyType"),
      description: formData.get("description"),
      price: formData.get("price"),
      leaseTerm: formData.get("leaseTerm"),
      status: formData.get("status") || "Available",
      
      // Features
      bedrooms: formData.get("bedrooms"),
      bathrooms: formData.get("bathrooms"),
      sizeSqm: formData.get("sizeSqm") ? formData.get("sizeSqm") : undefined, // Ensure empty strings are treated as undefined
      
      region: formData.get("region"),
      city: formData.get("city"),
      area: formData.get("area"),
      lat: formData.get("lat"),
      lng: formData.get("lng"),
      
      // Arrays
      amenities: formData.getAll("amenities"),
      landmarks: landmarksArray, // Parsed array from comma-separated string
      
      hasSmartLock: formData.get("hasSmartLock") === "on",
      accessInstructions: formData.get("accessInstructions"),
      media: formData.getAll("media"),
    };

    const validationResult = createPropertySchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error("Property validation failed:", {
        errors: validationResult.error.flatten(),
        timestamp: new Date().toISOString(),
      });
      return {
        success: false,
        message: "Validation failed. Please check your input.",
        error: "Invalid input data. Please check your form fields." 
      };
    }

    const validData = validationResult.data;

    // --- 6. Business Logic: Upload Files (A06: Vulnerable Components) ---
    const uploadedImageUrls = await uploadToCloudinary(validData.media, `wunkathomes/properties`); 

    // --- 7. Database Operations (A03: Injection prevention via Mongoose) ---
    await connectToDatabase();
    
    // Using a MongoDB session for transactional integrity (Property + Listing creation)
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      // 7a. Create the Base Property
      const newProperty = await Property.create([{
        propertyType: validData.propertyType,
        location: {
          region: validData.region,
          area: validData.area,
          city: validData.city || undefined,
        },
        coordinates: {
          lat: validData.lat,
          lng: validData.lng,
        },
        landmarks: validData.landmarks, // <--- Add Landmarks to Property Schema
        generalAmenities: validData.amenities,
      }], { session: dbSession });

      // 7b. Create the Listing mapped to the Property
      await Listing.create([{
        propertyId: newProperty[0]._id,
        listingType: validData.listingType,
        status: validData.status,
        price: validData.price,
        title: validData.title,
        description: validData.description,
        features: {                     // <--- Add Features mapping
          bedrooms: validData.bedrooms,
          bathrooms: validData.bathrooms,
          sizeSqm: validData.sizeSqm || undefined,
        },
        terms: {
          leaseTerm: validData.leaseTerm || undefined,
        },
        smartLock: {
          hasSmartLock: validData.hasSmartLock,
          accessInstructions: validData.accessInstructions || undefined,
        },
        images: uploadedImageUrls,
      }], { session: dbSession });

      await dbSession.commitTransaction();
      
      // --- 8. Success Logging (A09: Security Logging and Monitoring) ---
      console.info("Property created successfully", {
        propertyId: newProperty[0]._id,
        timestamp: new Date().toISOString(),
      });
      
    } catch (dbError) {
      await dbSession.abortTransaction();
      throw dbError; // Rethrow to be caught by the outer catch block
    } finally {
      dbSession.endSession();
    }

    // --- 9. Revalidate Cache (Performance/State) ---
    revalidatePath("/admin/properties");

    return { 
      success: true, 
      message: "Property created successfully. Redirecting to properties list...",
    };
  } catch (error) {
    // --- 10. Logging Failures (A09: Security Logging and Monitoring Failures) ---
    console.error("[CRITICAL] Server action error in createPropertyAction:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    
    // --- 11. Fail Securely (A05: Security Misconfiguration) ---
    return { 
      success: false, 
      message: "An unexpected system error occurred while processing your request.", 
      error: "An unexpected system error occurred while processing your request." 
    };
  }
}