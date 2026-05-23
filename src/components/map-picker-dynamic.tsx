"use client";

import dynamic from "next/dynamic";

export const MapPickerDynamic = dynamic(() => import("./map-picker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] bg-slate-100 animate-pulse rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 font-medium">
      Loading geographic engine...
    </div>
  ),
});