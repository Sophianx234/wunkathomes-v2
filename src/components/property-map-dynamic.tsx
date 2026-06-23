'use client';
import dynamic from "next/dynamic";

export const PropertyMap = dynamic(() => import("@/components/property-map"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[250px] bg-zinc-100/50 rounded-lg border border-zinc-200/60 flex items-center justify-center text-zinc-400 mb-6">
      Loading map...
    </div>
  )
});
