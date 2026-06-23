"use client";

import dynamic from "next/dynamic";

export const MapPickerDynamic = dynamic(() => import("./map-picker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] bg-zinc-100/50 animate-pulse rounded-lg border border-zinc-200/60 flex items-center justify-center text-zinc-400 font-medium">
      Loading geographic engine...
    </div>
  ),
});
