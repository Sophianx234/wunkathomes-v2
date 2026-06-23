import { connectToDatabase } from "@/config/DbConnect";
import Tour from "@/models/tour";
import Listing from "@/models/listing";
import Property from "@/models/property";
// Import the clean type structure from the client file to enforce strict type compliance
import TourTable, { TourRecord } from "@/components/tour-table"; 
import { Toaster } from "@/components/ui/sonner";

export const dynamic = "force-dynamic";

async function getTours(): Promise<TourRecord[]> {
  await connectToDatabase();
  
  const rawTours = await Tour.find()
    .populate({
      path: "listingId",
      model: Listing,
      populate: { path: "propertyId", model: Property }
    })
    .sort({ createdAt: -1 })
    .lean();

  // Explicitly map into the TourRecord shape to fulfill full type compliance
  return rawTours.map((tour: any) => ({
    id: tour._id.toString(),
    phoneNumber: tour.phoneNumber,
    // Safe Fallback: Prevents crashing if a date document field is corrupted or empty
    scheduledDate: tour.scheduledDate ? new Date(tour.scheduledDate).toISOString() : new Date().toISOString(),
    // Strict Type Casting: Safely anchors string properties to the TourStatus union type literal
    status: (tour.status || "Pending_Time") as any, 
    notes: tour.notes || "",
    listing: {
      id: tour.listingId?._id?.toString() || "",
      slug: tour.listingId?.slug || "",
      title: tour.listingId?.title || "Unknown Listing",
      price: tour.listingId?.price || 0,
      property: {
        propertyType: tour.listingId?.propertyId?.propertyType || "Unknown",
        location: tour.listingId?.propertyId?.location 
          ? `${tour.listingId.propertyId.location.area || ""}, ${tour.listingId.propertyId.location.region || ""}`
          : "Unknown Location",
      },
      features: {
        bedrooms: tour.listingId?.features?.bedrooms || 0,
        bathrooms: tour.listingId?.features?.bathrooms || 0,
        sizeSqm: tour.listingId?.features?.sizeSqm || 0,
      },
      image: tour.listingId?.images?.[0] || "/placeholder.jpg",
    }
  }));
}

export default async function TourManagementPage() {
  const tours = await getTours();

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <TourTable initialTours={tours} />
      </div>
    </div>
  );
}
