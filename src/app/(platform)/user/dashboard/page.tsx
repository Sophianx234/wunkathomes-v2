import { redirect } from "next/navigation";
import { getSession, SessionPayload } from "@/lib/session";
import User from "@/models/user";
import Lease from "@/models/lease";
import "@/models/listing";
import "@/models/property"; 

import { UserDashboard } from "@/components/user-dashboard";
import { connectToDatabase } from "@/config/DbConnect";
import Link from "next/link";

export default async function DashboardPage() {
  const session = (await getSession()) as SessionPayload;
  if (!session?.userId) redirect("/login");

  await connectToDatabase();

  const dbUser = await User.findById(session.userId).lean();
  if (!dbUser) redirect("/login");

  const dbLeases = await Lease.find({
    userId: session.userId,
    status: { $in: ["Pending_Verification", "Awaiting_Admin_Approval", "Active"] },
  })
    .select("+smartLockPin")
    .populate({
      path: "listingId",
      populate: { path: "propertyId" }, 
    })
    .sort({ createdAt: -1 }) 
    .lean();

  if (!dbLeases || dbLeases.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50/50 text-zinc-500 font-bold uppercase tracking-widest text-sm">
        <div className="text-center space-y-4">
          <p>No active leases found. Please explore properties.</p>
          <Link href="/" className="bg-black hover:bg-zinc-900 text-white font-bold py-3 px-4 rounded">
            Explore Properties
          </Link>
        </div>
      </div>
    );
  }

  const serializedUser = {
    name: dbUser.name,
    kycStatus: dbUser.kycStatus || "Unverified",
  };

  const serializedActiveLeases = await Promise.all(dbLeases.map(async (dbLease: any) => {
    let endDate = dbLease.endDate;
    if (!endDate && dbLease.startDate) {
      const end = new Date(dbLease.startDate);
      end.setFullYear(end.getFullYear() + 1); 
      endDate = end;
    }

    const listingDoc = dbLease.listingId as any;
    const propertyDoc = listingDoc?.propertyId;
    const loc = propertyDoc?.location || listingDoc?.location;
    const locationString = loc
      ? typeof loc === "string" ? loc : `${loc.area}, ${loc.city || loc.region}`
      : "Accra, Ghana";

    // Fetch Smart Lock for this property/listing
    let lockData = null;
    if (listingDoc) {
      const { default: SmartLock } = await import("@/models/smartlock");
      const lock = await SmartLock.findOne({
        $or: [{ propertyId: propertyDoc?._id }, { listingId: listingDoc._id }],
      }).lean();
      
      if (lock) {
        lockData = {
          activeTempPins: (lock.activeTempPins || []).map((pin: any) => ({
            pinId: pin.pinId,
            name: pin.name,
            pinMasked: pin.pinMasked,
            validFrom: pin.validFrom ? pin.validFrom.toISOString() : null,
            expiresAt: pin.expiresAt ? pin.expiresAt.toISOString() : null,
          })),
        };
      }
    }

    return {
      lease: {
        id: dbLease._id.toString(),
        status: dbLease.status,
        totalRentAmount: dbLease.totalRentAmount,
        startDate: dbLease.startDate ? new Date(dbLease.startDate).toISOString() : new Date().toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        smartLockPin: dbLease.smartLockPin,
        intentToVacate: dbLease.intentToVacate || false,
        signatureAudit: {
          isSigned: dbLease.signatureAudit?.isSigned || false,
        },
      },
      listing: {
        title: listingDoc?.title || "WunkatHomes Property",
        images: listingDoc?.images || [],
        location: locationString,
        propertyType: propertyDoc?.propertyType?.replace("_", " ") || "Property",
        bedrooms: listingDoc?.features?.bedrooms || 0,
        bathrooms: listingDoc?.features?.bathrooms || 0,
        sizeSqm: listingDoc?.features?.sizeSqm || 0,
        amenities: propertyDoc?.generalAmenities || [],
      },
      lock: lockData,
    };
  }));

  const { getCleaningSchedule } = await import("@/actions/user/cleaning.action");
  const scheduleRes = await getCleaningSchedule();
  const initialSchedule = scheduleRes.success ? scheduleRes.data : null;

  return (
    <UserDashboard
      user={serializedUser}
      activeLeases={serializedActiveLeases}
      initialSchedule={initialSchedule}
    />
  );
}
