"use client";

import { useState } from "react";
import { format } from "date-fns";
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
    <div className="bg-white rounded-xl border border-zinc-200/60 p-6 md:p-8 shadow-sm flex flex-col w-full box-border">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HugeiconsIcon icon={SparklesIcon} size={18} className="text-black" />
            <h3 className="font-bold text-lg text-zinc-900 tracking-tight">Cleaning Service</h3>
          </div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
            50 GHS / Day • Billed Later
          </p>
        </div>

        {/* Minimalist Segmented Control */}
        <div className="flex bg-zinc-100 p-1 rounded-lg w-full md:w-auto">
          {["custom", "weekly", "daily"].map((type) => (
            <button
              key={type}
              onClick={() => setScheduleType(type as any)}
              className={`flex-1 md:flex-none md:w-24 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${
                scheduleType === type
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        {/* Custom Mode - Ultra Minimal Calendar */}
        {scheduleType === "custom" && (
          <div className="flex flex-col items-center">
            <Calendar
              mode="multiple"
              selected={customDates}
              onSelect={(dates) => setCustomDates(dates as Date[] || [])}
              className="w-full max-w-[360px] flex justify-center"
              disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
            />
            {customDates.length > 0 && (
              <p className="text-xs font-medium text-zinc-500 mt-4">
                {customDates.length} day{customDates.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        )}

        {/* Weekly Mode - Minimalist Days */}
        {scheduleType === "weekly" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="flex gap-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((dayLetter, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleWeeklyDay(idx)}
                  className={`w-10 h-10 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                    weeklyDays.includes(idx)
                      ? "bg-black text-white"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  }`}
                >
                  {dayLetter}
                </button>
              ))}
            </div>
            {weeklyDays.length > 0 && (
              <p className="text-xs font-medium text-zinc-500 mt-6">
                Repeats every week on selected days
              </p>
            )}
          </div>
        )}

        {/* Daily Mode - Clean Typography */}
        {scheduleType === "daily" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h4 className="text-2xl font-black tracking-tight text-zinc-900 mb-2">Every Day</h4>
            <p className="text-sm font-medium text-zinc-500 max-w-[250px] leading-relaxed">
              Cleaners will automatically be dispatched to your property daily.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-100 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest px-8"
        >
          {isSubmitting ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
