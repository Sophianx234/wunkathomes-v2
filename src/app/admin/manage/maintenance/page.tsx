import { connectToDatabase } from "@/config/DbConnect";
import Maintenance from "@/models/maintenance";
import User from "@/models/user";
import Listing from "@/models/listing";
import Property from "@/models/property";
import MaintenanceClient from "@/components/maintenance-client";

export const dynamic = "force-dynamic";

async function getMaintenanceTickets() {
  await connectToDatabase();

  const rawTickets = await Maintenance.find()
    .populate({ 
      path: "userId", 
      model: User,
      select: "name email profilePicture phone"
    })
    .populate({
      path: "listingId",
      model: Listing,
      select: "title slug images",
      populate: { path: "propertyId", model: Property, select: "location propertyType" }
    })
    .sort({ createdAt: -1 })
    .lean();

  // Serialize Mongoose docs into safe, plain objects for the Client Component
  return rawTickets.map((ticket: any) => ({
    id: ticket._id.toString(),
    ticketNumber: ticket.ticketNumber,
    category: ticket.category,
    priority: ticket.priority,
    title: ticket.title,
    description: ticket.description,
    images: ticket.images || [],
    status: ticket.status,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    user: {
      name: ticket.userId?.name || "Unknown Tenant",
      email: ticket.userId?.email || "",
      phone: ticket.userId?.phone || "N/A",
      profilePicture: ticket.userId?.profilePicture || "/default-avatar.png",
    },
    listing: {
      title: ticket.listingId?.title || "Unknown Property",
      slug: ticket.listingId?.slug || "",
      image: ticket.listingId?.images?.[0] || "/placeholder.jpg",
      location: ticket.listingId?.propertyId?.location 
        ? `${ticket.listingId.propertyId.location.area}, ${ticket.listingId.propertyId.location.region}`
        : "Unknown Location",
    }
  }));
}

export default async function MaintenancePage() {
  const tickets = await getMaintenanceTickets();

  return <MaintenanceClient initialTickets={tickets} />;
}
