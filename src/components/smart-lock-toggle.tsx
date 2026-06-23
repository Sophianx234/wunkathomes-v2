"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function SmartLockToggle() {
  const [hasSmartLock, setHasSmartLock] = useState(false);

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
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Label htmlFor="accessInstructions" className="text-[13px] font-medium text-zinc-700">Access Instructions (Private)</Label>
            <Textarea name="accessInstructions" id="accessInstructions" placeholder="e.g. Use code 4092#..." className="min-h-[100px] bg-zinc-50/50 border-zinc-200/60 focus:ring-zinc-950 text-[14px]" />
            <p className="text-[12px] text-zinc-500 mt-1">This information is hidden from public queries.</p>
          </div>
        )}
      </div>
    </div>
  );
}
