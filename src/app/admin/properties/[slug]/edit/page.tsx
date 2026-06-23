import { notFound } from "next/navigation";
import { connectToDatabase } from "@/config/DbConnect";
import Listing from "@/models/listing";
import Property from "@/models/property"; // Required for Mongoose to populate
import EditPropertyForm from "@/components/edit-property-form";

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
    .populate("propertyId")
    .lean();

  if (!rawListing) {
    notFound();
  }

  // Serialize the MongoDB document to pass safely to the Client Component
  const initialData = JSON.parse(JSON.stringify(rawListing));

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen bg-zinc-50/50 font-sans">
      <div className="min-w-4xl w-full mx-auto p-6 md:p-8 space-y-6 pb-20">
        <EditPropertyForm initialData={initialData} />
      </div>
    </div>
  );
}