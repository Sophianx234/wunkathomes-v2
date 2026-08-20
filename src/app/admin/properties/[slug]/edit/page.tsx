import { notFound } from "next/navigation";
import { connectToDatabase } from "@/config/DbConnect";
import Listing from "@/models/listing";
import Property from "@/models/property"; // Required for Mongoose to populate
import EditPropertyForm from "@/components/edit-property-form";
import { getUnassignedLocks } from "@/actions/admin/smartlock.action";
import SmartLock from "@/models/smartlock";

export const metadata = {
  title: "Edit Property | Portfolio Management",
  description: "Update the details of an existing real estate asset.",
};

export default async function EditPropertyPage({
  params,
}: {
  // 1. Awaitable params with 'slug' instead of 'id'
  params: Promise<{ slug: string }>;
}) {
  await connectToDatabase();

  // 2. Await the params object
  const resolvedParams = await params;
  
  // 3. Decode just in case the browser adds %20 for spaces
  const cleanSlug = decodeURIComponent(resolvedParams.slug);

  // 4. Use findOne to query by the slug field
  const rawListing = await Listing.findOne({ slug: cleanSlug })
    .select("+smartLock.accessInstructions") // Must explicitly request this because it is hidden by default
    .populate("propertyId")
    .lean();

  if (!rawListing) {
    notFound();
  }

  // Fetch unassigned locks
  const { locks: unassignedLocks } = await getUnassignedLocks();
  
  // Fetch the currently assigned lock (if any)
  let currentLock = null;
  if (rawListing.propertyId) {
    // Note: TypeScript might complain if we don't safely extract the _id.
    const propId = (rawListing.propertyId as any)._id || rawListing.propertyId;
    currentLock = await SmartLock.findOne({ propertyId: propId }).lean();
  }

  // Serialize the MongoDB document to pass safely to the Client Component
  const initialData = JSON.parse(JSON.stringify(rawListing));
  const serializedUnassigned = JSON.parse(JSON.stringify(unassignedLocks || []));
  const serializedCurrentLock = currentLock ? JSON.parse(JSON.stringify(currentLock)) : null;

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen bg-zinc-50/50 font-sans">
      <div className="min-w-4xl w-full mx-auto p-6 md:p-8 space-y-6 pb-20">
        <EditPropertyForm 
          initialData={initialData} 
          unassignedLocks={serializedUnassigned}
          currentLock={serializedCurrentLock}
        />
      </div>
    </div>
  );
}