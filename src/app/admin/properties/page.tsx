import PropertiesFilterBar from "@/components/properties-filter-bar";
import PropertiesGrid from "@/components/properties-grid";
import Listing from "@/models/listing";
import mongoose from "mongoose";
import Property from "@/models/property";
import { Suspense } from "react";
import { IProperty } from "@/components/property-card";
import { connectToDatabase } from "@/config/DbConnect";

export const dynamic = "force-dynamic";

function PropertiesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col bg-white border border-zinc-200/60 rounded-lg overflow-hidden animate-[pulse_1.8s_ease-in-out_infinite]">
          <div className="w-full h-56 bg-zinc-100/50" />
          <div className="p-4 space-y-4 border-t border-slate-50">
            <div className="h-4 bg-zinc-100/50 rounded w-3/4" />
            <div className="h-3 bg-zinc-100/50 rounded w-1/2" />
            <div className="flex justify-between pt-2">
              <div className="h-4 bg-zinc-100/50 rounded w-1/4" />
              <div className="h-4 bg-zinc-100/50 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

import { getAdminProperties } from "@/actions/shared/fetch-properties.action";

async function DataLoader({ 
  params, 
  page 
}: { 
  params: { [key: string]: string | undefined }; 
  page: number 
}) {
  const { properties, hasMore, totalAssets } = await getAdminProperties(page, 12, params);

  return (
    <>
      <PropertiesFilterBar totalAssets={totalAssets || 0} />
      <PropertiesGrid key={JSON.stringify(params)} initialListings={properties} initialHasMore={hasMore} params={params} />
    </>
  );
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams.page || "1", 10));

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen bg-zinc-50/50">
      <div className="max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        <Suspense key={currentPage} fallback={
          <>
            <PropertiesFilterBar totalAssets={0} />
            <PropertiesGridSkeleton />
          </>
        }>
          <DataLoader params={resolvedParams} page={currentPage} />
        </Suspense>
      </div>
    </div>
  );
}
