import React from "react";

interface DataTableSkeletonProps {
  rows?: number;
}

export function DataTableSkeleton({ rows = 10 }: DataTableSkeletonProps) {
  return (
    <div className="w-full bg-white border border-zinc-200/60 rounded-lg overflow-hidden animate-[pulse_1.8s_ease-in-out_infinite]">
      <div className="h-14 border-b border-zinc-200/60 bg-slate-50/50" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-20 border-b border-zinc-200/60 flex items-center px-4 gap-6">
          <div className="w-12 h-12 bg-zinc-100/50 rounded-full shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-zinc-100/50 rounded w-1/3" />
            <div className="h-3 bg-zinc-100/50 rounded w-1/4" />
          </div>
          <div className="w-32 h-4 bg-zinc-100/50 rounded shrink-0 hidden md:block" />
          <div className="w-24 h-6 bg-zinc-100/50 rounded-md shrink-0" />
          <div className="w-16 h-8 bg-zinc-100/50 rounded-md shrink-0" />
        </div>
      ))}
    </div>
  );
}
