import { connectToDatabase } from "@/config/DbConnect";
import Tour from "@/models/tour";
import Listing from "@/models/listing";
import Property from "@/models/property";
import TourTable from "@/components/tour-table";
import { Toaster } from "@/components/ui/sonner";

export const dynamic = "force-dynamic"; // Ensures fresh data for the admin panel

async function getTours() {
  await connectToDatabase();
  
  // Fetch tours and deeply populate the relations
  const rawTours = await Tour.find()
    .populate({
      path: "listingId",
      model: Listing,
      populate: { path: "propertyId", model: Property }
    })
    .sort({ createdAt: -1 })
    .lean();

  // Serialize Mongoose docs into safe, plain objects for the Client Component
  return rawTours.map((tour: any) => ({
    id: tour._id.toString(),
    phoneNumber: tour.phoneNumber,
    scheduledDate: tour.scheduledDate.toISOString(),
    status: tour.status,
    notes: tour.notes || "",
    listing: {
      id: tour.listingId?._id.toString() || "",
      slug: tour.listingId?.slug || "",
      title: tour.listingId?.title || "Unknown Listing",
      price: tour.listingId?.price || 0,
      property: {
        propertyType: tour.listingId?.propertyId?.propertyType || "Unknown",
        location: tour.listingId?.propertyId?.location 
          ? `${tour.listingId.propertyId.location.area}, ${tour.listingId.propertyId.location.region}`
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
      
        
        {/* Pass the real server data to the interactive client component */}
        <TourTable initialTours={tours} />
      </div>
    </div>
  );
}