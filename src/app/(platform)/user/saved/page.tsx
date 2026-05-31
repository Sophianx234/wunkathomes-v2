import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { connectToDatabase } from "@/config/DbConnect";
import "@/models/listing";
import "@/models/property";
import PropertyCard, { IProperty } from "@/components/property-card";

import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon, ArrowRight01Icon, Home09Icon } from "@hugeicons/core-free-icons";
import SavePropertyButton from "@/components/ui/saved-property-button";
import SavedProperty from "@/models/saved";

export default async function SavedPropertiesPage() {
  const session = await getSession();
  
  if (!session || !session.userId) {
    redirect("/login");
  }

  await connectToDatabase();

  // 1. Fetch saved records
  const savedRecords = await SavedProperty.find({ user: session.userId })
    .populate({
      path: "property", 
      populate: {
        path: "propertyId" 
      }
    })
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  // 2. Serialize Data for Client Components
  const savedProperties: IProperty[] = savedRecords
    .filter((record) => record.property) 
    .map((record) => {
      const listingData = record.property as any;
      
      return {
        ...listingData,
        _id: listingData._id.toString(),
        property: {
          ...listingData.propertyId,
          _id: listingData.propertyId?._id?.toString(),
        }
      } as IProperty;
    });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* --- PAGE HEADER --- */}
      <section className="bg-white border-b border-slate-200 pt-12 pb-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl uppercase font-black  text-slate-900 flex items-center gap-3">
              {/* <HugeiconsIcon icon={FavouriteIcon} size={28} className="text-red-500 fill-red-500" /> */}
              My Saved Homes
            </h1>
            <p className="text-slate-500 mt-2 text-sm md:text-base">
              Keep track of the properties you love. Compare and review them before making a decision.
            </p>
          </div>
          <p className="text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-full w-fit">
            {savedProperties.length} {savedProperties.length === 1 ? "Property" : "Properties"} Saved
          </p>
        </div>
      </section>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto px-4 pt-8">
        {savedProperties.length > 0 ? (
          /* PROPERTIES GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {savedProperties.map((property, index) => (
              <div key={property._id} className="relative group">
                <PropertyCard property={property} index={index} />
                
                {/* EFFICIENT FIX: We ALREADY know this property is saved, 
                  because it's in the SavedProperties list!
                  Just pass initialIsSaved={true} directly.
                */}
                <div className="absolute top-3 right-3 z-20">
                  <SavePropertyButton 
                    propertyId={property._id as string} 
                    initialIsSaved={true} 
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white    mx-auto mt-8">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
              <HugeiconsIcon icon={Home09Icon} size={32} className="text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No saved homes yet</h2>
            <p className="text-slate-500 max-w-md mb-8">
              You haven't added any properties to your favorites. Start exploring to find your perfect next home or office space.
            </p>
            <Link 
              href="/explore" 
              className="bg-zinc-950 hover:bg-zinc-800 text-white px-8 py-3.5 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              Explore Properties
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}