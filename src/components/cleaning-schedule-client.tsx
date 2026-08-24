"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { updateCleaningSchedule } from "@/actions/user/cleaning.action";
import { toast } from "sonner";
import {
  SparklesIcon,
  Calendar01Icon,
  CheckmarkBadge01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Label } from "./ui/label";

interface CleaningScheduleClientProps {
  initialSchedule: any;
}

export default function CleaningScheduleClient({ initialSchedule }: CleaningScheduleClientProps) {
  const [scheduleType, setScheduleType] = useState<"custom" | "daily" | "weekly">(
    initialSchedule?.scheduleType || "custom"
  );
  
  // Custom dates
  const [customDates, setCustomDates] = useState<Date[]>(
    initialSchedule?.customDates?.map((d: string) => new Date(d)) || []
  );

  // Weekly days (0=Sun, 1=Mon, ..., 6=Sat)
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
    <div className="bg-white rounded-xl border border-zinc-200/60 p-5 md:p-6 shadow-sm flex flex-col w-full box-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
          <HugeiconsIcon icon={SparklesIcon} size={20} />
        </div>
        <div>
          <h3 className="font-black text-lg text-zinc-900 tracking-tight">Cleaning Service</h3>
          <p className="text-sm font-medium text-zinc-500">
            50 GHS per scheduled day. Pay later.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Type Selector */}
        <div className="grid grid-cols-3 gap-2">
          {["custom", "weekly", "daily"].map((type) => (
            <button
              key={type}
              onClick={() => setScheduleType(type as any)}
              className={`py-2 px-3 text-sm font-bold uppercase tracking-widest rounded-lg border-2 transition-colors ${
                scheduleType === type
                  ? "border-black bg-black text-white"
                  : "border-zinc-200/60 text-zinc-500 hover:border-black/50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Custom Mode */}
        {scheduleType === "custom" && (
          <div className="flex flex-col items-center border border-zinc-200/60 rounded-xl p-4 bg-zinc-50/50">
            <Calendar
              mode="multiple"
              selected={customDates}
              onSelect={setCustomDates as any}
              className="bg-transparent"
              disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
            />
            <p className="text-xs text-zinc-500 mt-2 font-medium uppercase tracking-widest text-center">
              Select multiple specific days
            </p>
          </div>
        )}

        {/* Weekly Mode */}
        {scheduleType === "weekly" && (
          <div className="border border-zinc-200/60 rounded-xl p-4 bg-zinc-50/50">
            <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 block">
              Select Days of the Week
            </Label>
            <div className="flex flex-wrap gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleWeeklyDay(idx)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors border-2 ${
                    weeklyDays.includes(idx)
                      ? "bg-black text-white border-black"
                      : "bg-white border-zinc-200/60 text-zinc-700 hover:border-black/50"
                  }`}
                >
                  {dayName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Daily Mode */}
        {scheduleType === "daily" && (
          <div className="border border-zinc-200/60 rounded-xl p-4 bg-zinc-50/50 flex items-center gap-3">
            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={24} className="text-green-600" />
            <p className="text-sm font-bold text-zinc-700">
              Cleaners will be dispatched every single day.
            </p>
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full h-12 bg-black hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-xs"
        >
          {isSubmitting ? "Saving..." : "Save Schedule"}
        </Button>
      </div>
    </div>
  );
}
