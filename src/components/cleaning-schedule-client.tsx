"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { updateCleaningSchedule } from "@/actions/user/cleaning.action";
import { toast } from "sonner";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface CleaningScheduleClientProps {
  initialSchedule: any;
}

export default function CleaningScheduleClient({ initialSchedule }: CleaningScheduleClientProps) {
  const [scheduleType, setScheduleType] = useState<"custom" | "daily" | "weekly">(
    initialSchedule?.scheduleType || "custom"
  );
  
  const [customDates, setCustomDates] = useState<Date[]>(
    initialSchedule?.customDates?.map((d: string) => new Date(d)) || []
  );

  const [weeklyDays, setWeeklyDays] = useState<number[]>(
    initialSchedule?.weeklyDays || []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleWeeklyDay = (day: number) => {
    if (weeklyDays.includes(day)) {
      setWeeklyDays(weeklyDays.filter((d) => d !== day));
    } else {
      setWeeklyDays([...weeklyDays, day]);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const data = {
        scheduleType,
        customDates: scheduleType === "custom" ? customDates.map(d => d.toISOString()) : [],
        weeklyDays: scheduleType === "weekly" ? weeklyDays : [],
        status: "active" as const,
      };

      const result = await updateCleaningSchedule(data);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || "Failed to update schedule.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[20px] border border-zinc-200/80 shadow-sm flex flex-col w-full max-w-4xl mx-auto overflow-hidden">
      
      {/* HEADER */}
      <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-zinc-200/60 flex items-center justify-center bg-zinc-50/50">
            <HugeiconsIcon icon={SparklesIcon} size={20} className="text-zinc-700" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-zinc-900 tracking-tight">Cleaning Service</h2>
            <p className="text-[13px] text-zinc-500 mt-0.5">Schedule your property cleaning easily</p>
          </div>
        </div>
        <button className="p-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>
        </button>
      </div>

      {/* BODY GRID */}
      <div className="flex flex-col md:flex-row">
        
        {/* LEFT PANEL - INTERACTIVE AREA */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center bg-zinc-50/30 min-h-[340px]">
          {scheduleType === "custom" && (
            <div className="w-full flex justify-center">
              <Calendar
                mode="multiple"
                selected={customDates}
                onSelect={(dates) => setCustomDates(dates as Date[] || [])}
                className="w-full  border-0 bg-transparent shadow-none"
                classNames={{
                  day_selected: "!bg-black !text-white hover:!bg-zinc-800 hover:!text-white focus:!bg-black focus:!text-white shadow-md shadow-black/20"
                }}
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
              />
            </div>
          )}

          {scheduleType === "weekly" && (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div className="flex gap-2.5">
                {["S", "M", "T", "W", "T", "F", "S"].map((dayLetter, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleWeeklyDay(idx)}
                    className={`w-11 h-11 rounded-full text-[13px] font-semibold transition-all flex items-center justify-center ${
                      weeklyDays.includes(idx)
                        ? "bg-black text-white shadow-md shadow-black/10"
                        : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                    }`}
                  >
                    {dayLetter}
                  </button>
                ))}
              </div>
              <p className="text-[13px] font-medium text-zinc-500 mt-6">
                Select the days for your weekly cleaning
              </p>
            </div>
          )}

          {scheduleType === "daily" && (
            <div className="flex flex-col items-center justify-center w-full h-full text-center">
              <div className="w-16 h-16 bg-white rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-center mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-800"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>
              </div>
              <h4 className="text-[17px] font-semibold tracking-tight text-zinc-900 mb-2">Every Day</h4>
              <p className="text-[13px] text-zinc-500 max-w-[260px] leading-relaxed">
                Cleaners will be automatically dispatched to your property daily.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL - SETTINGS */}
        <div className="w-full md:w-[360px] shrink-0 border-t md:border-t-0 md:border-l border-zinc-100 bg-white">
          <div className="p-6 md:p-8 space-y-6">
             
             {/* Frequency Field */}
             <div>
                <label className="text-[13px] font-semibold text-zinc-900 mb-2 block flex items-center gap-1">
                  Schedule Mode <span className="text-blue-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-0 border border-zinc-200/80 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-black/5 transition-shadow">
                   <div className="border-r border-zinc-200/80 bg-white relative">
                     <select 
                       value={scheduleType} 
                       onChange={(e) => setScheduleType(e.target.value as any)}
                       className="w-full h-[42px] pl-3 pr-8 text-[13px] font-medium text-zinc-900 bg-transparent border-none focus:ring-0 cursor-pointer outline-none appearance-none"
                     >
                       <option value="custom">Custom Dates</option>
                       <option value="weekly">Weekly Routine</option>
                       <option value="daily">Daily Service</option>
                     </select>
                     <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                     </div>
                   </div>
                   <div className="bg-zinc-50/50 flex items-center px-3 h-[42px]">
                     <span className="text-[13px] text-zinc-500">Frequency</span>
                   </div>
                </div>
             </div>

             {/* Rate Field */}
             <div>
                <label className="text-[13px] font-semibold text-zinc-900 mb-2 block flex items-center gap-1">
                  Service Rate <span className="text-blue-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-0 border border-zinc-200/80 rounded-lg overflow-hidden">
                   <div className="border-r border-zinc-200/80 bg-white flex items-center px-3 h-[42px]">
                     <span className="text-[13px] font-medium text-zinc-900">50 GHS</span>
                   </div>
                   <div className="bg-zinc-50/50 flex items-center px-3 h-[42px]">
                     <span className="text-[13px] text-zinc-500">Per Day</span>
                   </div>
                </div>
             </div>

             {/* Billing Field */}
             <div className="group relative" title="payment would be collected by cleaner after service">
                <label className="text-[13px] font-semibold text-zinc-900 mb-2 flex items-center gap-1.5 cursor-help w-fit">
                  Billing Details
                  <div className="w-3.5 h-3.5 rounded-full border border-zinc-300 flex items-center justify-center text-[9px] text-zinc-400 font-serif italic">i</div>
                </label>
                <div className="w-full h-[42px] px-3 rounded-lg border border-zinc-200/80 bg-white text-[13px] font-medium flex items-center text-zinc-900">
                  Billed Later
                </div>
             </div>

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-6 py-4 border-t border-zinc-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-[13px] font-medium text-zinc-500">
          {scheduleType === "custom" && customDates.length > 0
            ? `Range: ${customDates.length} cleaning day(s) selected` 
            : scheduleType === "custom"
            ? "Range: No dates selected"
            : scheduleType === "weekly" && weeklyDays.length > 0
              ? `Range: ${weeklyDays.length} day(s) every week`
              : scheduleType === "weekly"
              ? "Range: No days selected"
              : "Range: Every day schedule active"}
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none h-10 bg-white text-[13px] font-medium text-zinc-700 hover:bg-zinc-50 border-zinc-200 rounded-lg px-5">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting} className="flex-1 sm:flex-none h-10 bg-black hover:bg-zinc-800 text-white text-[13px] font-medium rounded-lg px-6 shadow-sm border-0">
            {isSubmitting ? "Saving..." : "Update schedule"}
          </Button>
        </div>
      </div>
    </div>
  );
}
