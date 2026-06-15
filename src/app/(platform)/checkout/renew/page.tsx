import { notFound, redirect } from "next/navigation";
import { getSession, SessionPayload } from "@/lib/session";
import { connectToDatabase } from "@/config/DbConnect";
import User from "@/models/user";
import Lease from "@/models/lease";
import Listing from "@/models/listing";
import Property from "@/models/property";
import RenewClient from "@/components/renew-client";

interface RenewPageProps {
  searchParams: Promise<{ leaseId: string }>;
}

export default async function RenewPage({ searchParams }: RenewPageProps) {
  const session = (await getSession()) as SessionPayload;
  if (!session?.userId) redirect("/login");

  const params = await searchParams;
  const leaseId = params?.leaseId;

  if (!leaseId) redirect("/user/dashboard");

  await connectToDatabase();

  // Fetch the existing lease ensuring it belongs to this user
  const existingLease = await Lease.findOne({
    _id: leaseId,
    userId: session.userId,
  })
    .populate({
      path: "listingId",
      model: Listing,
      populate: { path: "propertyId", model: Property },
    })
    .lean()
    .exec();

  if (!existingLease) notFound();

  const userRecord = await User.findById(session.userId).lean().exec();

  const serializedData = {
    leaseId: existingLease._id.toString(),
    rentAmount: existingLease.totalRentAmount || existingLease.listingId.price,
    currentEndDate: existingLease.endDate
      ? new Date(existingLease.endDate).toLocaleDateString()
      : "N/A",
    user: {
      id: userRecord?._id.toString(),
      name: userRecord?.name || "",
      email: userRecord?.email || "",
      phone: userRecord?.phone || "",
    },
    listing: {
      title: existingLease.listingId.title,
      price: existingLease.listingId.price,
      image: existingLease.listingId.images?.[0] || "/placeholder.jpg",
      propertyType:
        existingLease.listingId.propertyId?.propertyType || "Property",
    },
  };

  return <RenewClient data={serializedData} />;
}
