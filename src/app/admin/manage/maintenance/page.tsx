import { Suspense } from "react";
import { connectToDatabase } from "@/config/DbConnect";
import Maintenance from "@/models/maintenance";
import User from "@/models/user";
import Listing from "@/models/listing";
import Property from "@/models/property";
import MaintenanceClient from "@/components/maintenance-client";

export const dynamic = "force-dynamic";

function MaintenanceSkeleton() {
  return (
    <div className="w-full bg-white border border-zinc-200/60 rounded-lg overflow-hidden animate-[pulse_1.8s_ease-in-out_infinite]">
      <div className="h-14 border-b border-zinc-200/60 bg-slate-50/50" />
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="h-24 border-b border-zinc-200/60 flex items-center px-4 gap-6">
          <div className="w-12 h-12 bg-zinc-100/50 rounded-full shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-zinc-100/50 rounded w-1/3" />
            <div className="h-3 bg-zinc-100/50 rounded w-1/4" />
          </div>
          <div className="w-24 h-4 bg-zinc-100/50 rounded shrink-0 hidden md:block" />
          <div className="w-24 h-6 bg-zinc-100/50 rounded-md shrink-0" />
          <div className="w-16 h-8 bg-zinc-100/50 rounded-md shrink-0" />
        </div>
      ))}
    </div>
  );
}

async function DataLoader({ page }: { page: number }) {
  await connectToDatabase();

  const limit = 12;
  const skipAmount = (page - 1) * limit;

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
    .skip(skipAmount)
    .limit(limit)
    .lean();

  const tickets = rawTickets.map((ticket: any) => ({
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

  return <MaintenanceClient initialTickets={tickets} />;
}

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams.page || "1", 10));

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <Suspense key={currentPage} fallback={<MaintenanceSkeleton />}>
          <DataLoader page={currentPage} />
        </Suspense>
      </div>
    </div>
  );
}
