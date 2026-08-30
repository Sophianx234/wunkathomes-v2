"use client";

import { useState } from "react";
import { updateTourSettings } from "@/actions/admin/settings.action";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, CheckmarkBadge01Icon } from "@hugeicons/core-free-icons";

const DAYS_OF_WEEK = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

export default function TourSettingsClient({ initialDays, initialPrice }: { initialDays: number[], initialPrice: number }) {
  const [selectedDays, setSelectedDays] = useState<number[]>(initialDays);
  const [tourPrice, setTourPrice] = useState<number>(initialPrice || 50);
  const [isSaving, setIsSaving] = useState(false);

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (selectedDays.length === 0) {
      toast.error("Please select at least one available day.");
      return;
    }
    
    setIsSaving(true);
    try {
      await updateTourSettings(selectedDays, tourPrice);
      toast.success("Tour availability updated successfully!");
    } catch (error) {
      toast.error("Failed to update availability.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanged = JSON.stringify(initialDays.slice().sort()) !== JSON.stringify(selectedDays.slice().sort()) || initialPrice !== tourPrice;

  return (
    <div className="w-full bg-white border border-zinc-200/60 rounded-xl p-5 md:p-6 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <HugeiconsIcon icon={Calendar01Icon} size={18} />
            Tour Availability Schedule
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Select the days of the week you are available to conduct property tours. This will restrict the dates users can pick on the booking calendar.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanged || isSaving}
          className="bg-black text-white text-xs font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors shrink-0 justify-center w-full md:w-auto"
        >
          {isSaving ? "Saving..." : "Save Settings"}
          {!isSaving && <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} />}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center border-t border-zinc-100 pt-5">
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">Available Days</label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map(day => {
              const isSelected = selectedDays.includes(day.value);
              return (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg border-2 transition-all ${
                    isSelected 
                      ? "border-black bg-black text-white" 
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
          <label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">Viewing Fee (GHS)</label>
          <input
            type="number"
            min="0"
            value={tourPrice}
            onChange={(e) => setTourPrice(Number(e.target.value))}
            className="w-full md:w-32 px-4 py-2 text-sm font-bold border-2 border-zinc-200 rounded-lg focus:outline-none focus:border-black transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

