"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function SmartLockToggle({ 
  unassignedLocks = [],
  currentLock = null,
  initialAccessInstructions = ""
}: { 
  unassignedLocks?: any[],
  currentLock?: any,
  initialAccessInstructions?: string
}) {
  // If there's a currentLock, it means this property has a lock enabled
  const [hasSmartLock, setHasSmartLock] = useState(!!currentLock);
  const [selectedLock, setSelectedLock] = useState(currentLock ? currentLock._id : "");

  // Combine currentLock into the list of options so it can be re-selected if they toggle off and on
  const availableLocks = currentLock 
    ? [currentLock, ...unassignedLocks.filter(l => l._id !== currentLock._id)]
    : unassignedLocks;

  return (
    <div className="bg-white rounded-lg border border-zinc-200/60 p-8">
      <h2 className="text-[18px] font-medium text-zinc-900 mb-6 pb-3 border-b border-zinc-200/60">Access Control</h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-200/60 bg-slate-50/50">
          <div className="space-y-0.5">
            <Label className="text-[14px] font-medium text-zinc-900">Smart Lock Enabled</Label>
            <p className="text-[13px] text-zinc-500">Property requires digital access codes for viewing.</p>
          </div>
          {/* Hidden input to pass boolean to Server Action */}
          <input type="hidden" name="hasSmartLock" value={hasSmartLock ? "on" : "off"} />
          <Switch checked={hasSmartLock} onCheckedChange={setHasSmartLock} className="data-[state=checked]:bg-zinc-950" />
        </div>

        {hasSmartLock && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* NEW: Dropdown for assigning the Tuya lock */}
            <div className="space-y-2">
              <Label htmlFor="smartLockId" className="text-[13px] font-medium text-zinc-700">Assign Tuya Lock</Label>
              {availableLocks.length === 0 ? (
                <div className="p-3 bg-amber-50 text-amber-700 rounded-md text-[13px] border border-amber-200">
                  No unassigned locks found in the system. Please register hardware in the Smart Locks admin page first.
                </div>
              ) : (
                <select 
                  id="smartLockId"
                  name="smartLockId" 
                  value={selectedLock}
                  onChange={(e) => setSelectedLock(e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-50/50 border border-zinc-200/60 rounded-md text-[14px] focus:ring-zinc-950 outline-none"
                >
                  <option value="">-- Do not assign a Tuya lock yet --</option>
                  {availableLocks.map(lock => (
                    <option key={lock._id} value={lock._id}>
                      {lock.name} ({lock.tuyaDeviceId}) {lock._id === currentLock?._id ? '(Currently Assigned)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessInstructions" className="text-[13px] font-medium text-zinc-700">Access Instructions (Private)</Label>
              <Textarea defaultValue={initialAccessInstructions} name="accessInstructions" id="accessInstructions" placeholder="e.g. Use code 4092#..." className="min-h-[100px] bg-zinc-50/50 border-zinc-200/60 focus:ring-zinc-950 text-[14px]" />
              <p className="text-[12px] text-zinc-500 mt-1">This information is hidden from public queries.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
