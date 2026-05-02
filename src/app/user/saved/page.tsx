"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  Building04Icon, 
  EyeIcon, 
  LockKeyIcon, 
  ArrowRight01Icon,
  Calendar01Icon,
  Flame,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function SavedAssetsPage() {
  // Mock Data: Inject your real DB data here. 
  // Notice the 'fomoState' which drives the UI psychology.
  const savedProperties = [
    {
      id: "prop_1",
      slug: "glasshouse-villa",
      name: "The Glasshouse Villa",
      price: "$11,500",
      type: "For_Sale",
      image: "/images/properties/glasshouse.jpg", // Replace with actual image
      fomoState: "HIGH_DEMAND",
      fomoMessage: "4 private tours scheduled this week.",
    },
    {
      id: "prop_2",
      slug: "cantonments-penthouse",
      name: "Cantonments Penthouse",
      price: "$4,500 / mo",
      type: "For_Rent",
      image: "/images/properties/penthouse.jpg",
      fomoState: "AVAILABLE",
      fomoMessage: "Available for immediate digital hold.",
    },
    {
      id: "prop_3",
      slug: "ridge-townhome",
      name: "Ridge Executive Townhome",
      price: "$6,200 / mo",
      type: "For_Rent",
      image: "/images/properties/ridge.jpg",
      fomoState: "RESERVED_BY_OTHER",
      fomoMessage: "Reserved by another verified user.",
    }
  ];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* === Header === */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/10 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black mb-2">
            Saved Assets
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Monitor the market status of your shortlisted properties.
          </p>
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
          {savedProperties.length} Assets Tracked
        </div>
      </div>

      {/* === The Asset Grid === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {savedProperties.map((prop) => {
          // Logic for the grayed-out "Lost" state
          const isLost = prop.fomoState === "RESERVED_BY_OTHER";
          
          return (
            <div 
              key={prop.id} 
              className={`flex flex-col border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
                isLost 
                  ? "border-slate-200 bg-slate-50 opacity-75 grayscale" 
                  : "border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              }`}
            >
              
              {/* Image Container */}
              <div className="relative h-64 w-full bg-slate-200">
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  <HugeiconsIcon icon={Building04Icon} size={32} />
                </div>
                {/* <img src={prop.image} alt={prop.name} className="absolute inset-0 w-full h-full object-cover relative z-10" /> */}
                
                {/* FOMO Badges on the Image */}
                <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
                  
                  {/* Status Badge */}
                  {isLost ? (
                    <span className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded flex items-center gap-1.5 shadow-sm">
                      <HugeiconsIcon icon={LockKeyIcon} size={12} /> OFF MARKET
                    </span>
                  ) : (
                    <span className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded shadow-sm border border-black/10">
                      {prop.price}
                    </span>
                  )}

                  {/* High Demand Fire Badge */}
                  {prop.fomoState === "HIGH_DEMAND" && (
                    <span className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1.5 rounded flex items-center gap-1 shadow-sm animate-pulse">
                      <HugeiconsIcon icon={Flame} size={14} /> HOT
                    </span>
                  )}
                </div>
              </div>

              {/* Data & Actions */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className={`text-lg font-black uppercase tracking-tight mb-4 line-clamp-1 ${isLost ? "text-slate-500" : "text-black"}`}>
                  {prop.name}
                </h3>
                
                {/* The Psychological Trigger Text */}
                <div className={`p-3 rounded-lg flex items-start gap-2.5 mb-6 text-xs font-bold uppercase tracking-widest leading-relaxed ${
                  isLost 
                    ? "bg-slate-200/50 text-slate-500" 
                    : prop.fomoState === "HIGH_DEMAND"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-slate-50 text-slate-500 border border-slate-200"
                }`}>
                  {isLost && <HugeiconsIcon icon={LockKeyIcon} size={14} className="shrink-0 mt-0.5" />}
                  {prop.fomoState === "HIGH_DEMAND" && <HugeiconsIcon icon={EyeIcon} size={14} className="shrink-0 mt-0.5" />}
                  {prop.fomoState === "AVAILABLE" && <HugeiconsIcon icon={Calendar01Icon} size={14} className="shrink-0 mt-0.5" />}
                  {prop.fomoMessage}
                </div>

                {/* Call To Action */}
                <div className="mt-auto">
                  {isLost ? (
                    <button disabled className="w-full py-4 bg-slate-200 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-xl cursor-not-allowed">
                      Hold Placed by Another
                    </button>
                  ) : (
                    <Link href={`/properties/${prop.slug}`} className="w-full block">
                      <button className="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-black/20 flex items-center justify-center gap-2">
                        View & Secure Asset <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                      </button>
                    </Link>
                  )}
                </div>

              </div>
            </div>
          );
        })}

      </div>
      
      {/* Empty State (If they have no saved items) */}
      {savedProperties.length === 0 && (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
            <HugeiconsIcon icon={Building04Icon} size={24} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-black mb-2">No Assets Tracked</h3>
          <p className="text-xs font-medium text-slate-500 mb-6">You haven't saved any properties to your watchlist yet.</p>
          <Link href="/explore">
            <button className="px-6 py-3 border-2 border-black font-black uppercase tracking-widest text-xs rounded-lg hover:bg-slate-50 transition-colors">
              Explore Portfolio
            </button>
          </Link>
        </div>
      )}

    </div>
  );
}