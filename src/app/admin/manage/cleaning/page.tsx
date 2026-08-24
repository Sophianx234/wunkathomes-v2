import { connectToDatabase } from "@/config/DbConnect";
import CleaningSchedule from "@/models/cleaning";
import User from "@/models/user";
import Listing from "@/models/listing";
import Property from "@/models/property";
import { format } from "date-fns";

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

  // Helper to format custom dates
  const formatDates = (dates: Date[]) => {
    return dates.map(d => format(new Date(d), "MMM d, yyyy")).join(", ");
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Cleaning Schedules</h1>
        <p className="text-sm font-medium text-zinc-500">
          Manage and dispatch cleaning crews for active tenant schedules.
        </p>
      </div>

      <div className="bg-white border border-zinc-200/60 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 border-b border-zinc-200/60 font-bold uppercase tracking-widest text-[10px] text-zinc-500">
              <tr>
                <th className="px-6 py-4">Tenant</th>
                <th className="px-6 py-4">Property</th>
                <th className="px-6 py-4">Schedule Rule</th>
                <th className="px-6 py-4">Status / Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 font-medium">
                    No active cleaning schedules.
                  </td>
                </tr>
              ) : (
                schedules.map((schedule: any) => {
                  let isDispatchToday = false;
                  if (schedule.scheduleType === "daily") {
                    isDispatchToday = true;
                  } else if (schedule.scheduleType === "weekly") {
                    if (schedule.weeklyDays?.includes(dayOfWeek)) {
                      isDispatchToday = true;
                    }
                  } else if (schedule.scheduleType === "custom") {
                    const todayStr = format(today, "yyyy-MM-dd");
                    isDispatchToday = schedule.customDates?.some((d: Date) => format(new Date(d), "yyyy-MM-dd") === todayStr);
                  }

                  return (
                    <tr key={schedule._id.toString()} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-zinc-900">{schedule.userId?.name || "Unknown"}</div>
                        <div className="text-xs text-zinc-500">{schedule.userId?.email || ""}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-zinc-900">{schedule.listingId?.title || "Unknown Property"}</div>
                        <div className="text-xs text-zinc-500 truncate max-w-[200px]">
                          {schedule.listingId?.propertyId?.location?.area || "Unknown Location"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {schedule.scheduleType === "daily" && (
                          <span className="font-bold text-black border-b border-black">Daily</span>
                        )}
                        {schedule.scheduleType === "weekly" && (
                          <div>
                            <span className="font-bold text-black">Weekly: </span>
                            <span className="text-zinc-600">
                              {schedule.weeklyDays?.map((d: number) => dayNames[d]).join(", ")}
                            </span>
                          </div>
                        )}
                        {schedule.scheduleType === "custom" && (
                          <div className="max-w-[250px] truncate" title={formatDates(schedule.customDates)}>
                            <span className="font-bold text-black">Custom Dates: </span>
                            <span className="text-zinc-600">
                              {formatDates(schedule.customDates)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isDispatchToday ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                            Dispatch Today
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600">
                            Scheduled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
