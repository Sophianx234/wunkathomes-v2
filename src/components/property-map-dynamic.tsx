'use client';
import dynamic from "next/dynamic";

export const PropertyMap = dynamic(() => import("@/components/property-map"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[250px] bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 mb-6">
      Loading map...
    </div>
  )
});