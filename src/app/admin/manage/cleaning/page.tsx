import { connectToDatabase } from "@/config/DbConnect";
import CleaningSchedule from "@/models/cleaning";
import User from "@/models/user";
import Listing from "@/models/listing";
import Property from "@/models/property";
import { format } from "date-fns";
import CleaningDirectoryClient, { CleaningRecord } from "@/components/cleaning-directory-client";

export const dynamic = "force-dynamic";

export default async function AdminCleaningPage() {
  await connectToDatabase();

  const schedules = await CleaningSchedule.find({ status: "active" })
    .populate({
      path: "userId",
      model: User,
      select: "name email phone",
    })
    .populate({
      path: "listingId",
      model: Listing,
      select: "title",
      populate: { path: "propertyId", model: Property, select: "location" },
    })
    .sort({ createdAt: -1 })
    .lean();

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0-6
  const todayStr = format(today, "yyyy-MM-dd");

  const records: CleaningRecord[] = schedules.map((schedule: any) => {
    let isDispatchToday = false;
    if (schedule.scheduleType === "daily") {
      isDispatchToday = true;
    } else if (schedule.scheduleType === "weekly") {
      if (schedule.weeklyDays?.includes(dayOfWeek)) {
        isDispatchToday = true;
      }
    } else if (schedule.scheduleType === "custom") {
      isDispatchToday = schedule.customDates?.some(
        (d: Date) => format(new Date(d), "yyyy-MM-dd") === todayStr
      );
    }

    const loc = schedule.listingId?.propertyId?.location;
    const locationString = loc
      ? typeof loc === "string"
        ? loc
        : `${loc.area || ""}, ${loc.city || loc.region || ""}`
      : "Unknown Location";

    return {
      id: schedule._id.toString(),
      tenantName: schedule.userId?.name || "Unknown",
      tenantEmail: schedule.userId?.email || "",
      propertyTitle: schedule.listingId?.title || "Unknown Property",
      propertyLocation: locationString,
      scheduleType: schedule.scheduleType,
      weeklyDays: schedule.weeklyDays || [],
      customDates: schedule.customDates ? schedule.customDates.map((d: Date) => d.toISOString()) : [],
      isDispatchToday,
    };
  });

  const availableProperties = Array.from(
    new Set(records.map((r) => r.propertyTitle))
  ).sort();

  return (
    <div className="w-full max-w-[1400px] mx-auto p-6 lg:pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Cleaning Schedules</h1>
        <p className="text-sm font-medium text-zinc-500">
          Manage and dispatch cleaning crews for active tenant schedules.
        </p>
      </div>

      <CleaningDirectoryClient
        data={records}
        availableProperties={availableProperties}
      />
    </div>
  );
}
