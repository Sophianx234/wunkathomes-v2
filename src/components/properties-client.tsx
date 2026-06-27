"use client";

import {
  ArrowDown01Icon,
  Loading03FreeIcons,
  Location01Icon,
  Search01Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import PropertyCard from "@/components/property-card";
import { getPublicProperties } from "@/actions/shared/fetch-properties.action";

// --- Types & Constants ---
const PROPERTY_TYPES = ["All", "House", "Apartment", "Commercial", "Land"];

interface PropertiesClientProps {
  initialInventory: any[]; 
  initialHasMore: boolean;
  initialTotalAssets: number;
  availableAreas: string[];
  initialFilters: { typeFilter: string; statusFilter: string; locationFilter: string };
}

export default function PropertiesClient({ 
  initialInventory, 
  initialHasMore,
  initialTotalAssets,
  availableAreas,
  initialFilters
}: PropertiesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for items and pagination
  const [items, setItems] = useState(initialInventory);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [totalAssets, setTotalAssets] = useState(initialTotalAssets);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // State for filters
  const [typeFilter, setTypeFilter] = useState(initialFilters.typeFilter);
  const [statusFilter, setStatusFilter] = useState(initialFilters.statusFilter);
  const [locationFilter, setLocationFilter] = useState(initialFilters.locationFilter);

  // Sync state when props change due to URL/Server Component re-render
  useEffect(() => {
    setItems(initialInventory);
    setHasMore(initialHasMore);
    setTotalAssets(initialTotalAssets);
    setPage(1);
    setTypeFilter(initialFilters.typeFilter);
    setStatusFilter(initialFilters.statusFilter);
    setLocationFilter(initialFilters.locationFilter);
  }, [initialInventory, initialHasMore, initialTotalAssets, initialFilters]);

  // Update URL seamlessly when filters change
  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All" || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value.toLowerCase());
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleTypeChange = (type: string) => {
    updateUrl("type", type);
  };

  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const { properties, hasMore: newHasMore, totalAssets: newTotal } = await getPublicProperties(nextPage, 12, {
        type: typeFilter,
        status: statusFilter,
        location: locationFilter
      });
      setItems((prev) => [...prev, ...properties]);
      setPage(nextPage);
      setHasMore(newHasMore);
      setTotalAssets(newTotal);
    } catch (error) {
      console.error("Failed to load more properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-12 md:pb-24 w-full overflow-x-hidden box-border">
      {/* === Sticky Glassmorphism Filter Bar === */}
      <div className=" top-20 fixed md:top-20 z-40 bg-white/95 backdrop-blur-xl border-y border-zinc-200/60 shadow-sm mb-6 md:mb-12 transition-all w-full box-border">
        <div className="max-w-7xl mx-auto px-2 md:px-4 sm:px-6 lg:px-8 py-2 md:py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3 md:gap-4 w-full box-border">
          
          {/* Left: Property Type Pills */}
          <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-1 md:pb-2 xl:pb-0 hide-scrollbar mask-fade-right w-full min-w-0 box-border">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`whitespace-nowrap px-3 py-1.5 md:px-6 md:py-2.5 rounded-full text-[9px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 shrink-0 ${
                  typeFilter.toLowerCase() === type.toLowerCase()
                    ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] -translate-y-[1px]"
                    : "bg-zinc-100/50 text-zinc-500 hover:bg-zinc-200 hover:text-black"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Right: Dropdown Filters & Count */}
          <div className="flex flex-row flex-wrap sm:flex-nowrap items-center gap-2 md:gap-4 w-full xl:w-auto box-border">
            
            {/* Status Dropdown */}
            <div className="flex-1 sm:flex-none sm:w-[120px] md:w-[160px] min-w-0 box-border">
              <Select
                onValueChange={(val) => {
                  updateUrl("status", val);
                }}
                value={statusFilter}
              >
                <SelectTrigger className="w-full bg-zinc-50/50 border-zinc-200/60 rounded-full h-8 md:h-11 text-[9px] md:text-xs font-bold uppercase tracking-widest focus:ring-0 focus:ring-offset-0 [&_.dropdown-icon]:hidden min-w-0 box-border px-2 md:px-3">
                  <span className="scale-75 md:scale-100 flex items-center shrink-0">
                    <HugeiconsIcon
                      icon={Tag01Icon}
                      size={16}
                      className="text-zinc-400 mr-1 md:mr-2 dropdown-icon"
                    />
                  </span>
                  <SelectValue placeholder="Status" className="truncate" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-lg md:rounded-lg">
                  <SelectItem value="all" className="text-[9px] md:text-xs font-bold uppercase tracking-wider py-2 md:py-3 cursor-pointer">
                    All Statuses
                  </SelectItem>
                  <SelectItem value="For_Rent" className="text-[9px] md:text-xs font-bold uppercase tracking-wider py-2 md:py-3 cursor-pointer">
                    For Rent
                  </SelectItem>
                  <SelectItem value="For_Sale" className="text-[9px] md:text-xs font-bold uppercase tracking-wider py-2 md:py-3 cursor-pointer">
                    For Sale
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Dropdown */}
            <div className="flex-1 sm:flex-none sm:w-[140px] md:w-[180px] min-w-0 box-border">
              <Select
                onValueChange={(val) => {
                  updateUrl("location", val);
                }}
                value={locationFilter}
              >
                <SelectTrigger className="w-full bg-zinc-50/50 border-zinc-200/60 rounded-full h-8 md:h-11 text-[9px] md:text-xs font-bold uppercase tracking-widest focus:ring-0 focus:ring-offset-0 [&_.dropdown-icon]:hidden min-w-0 box-border px-2 md:px-3">
                  <span className="scale-75 md:scale-100 flex items-center shrink-0">
                    <HugeiconsIcon
                      icon={Location01Icon}
                      size={16}
                      className="text-zinc-400 mr-1 md:mr-2 dropdown-icon"
                    />
                  </span>
                  <SelectValue placeholder="Location" className="truncate" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-lg md:rounded-lg w-[calc(100vw-1rem)] sm:w-auto">
                  <SelectItem value="all" className="text-[9px] md:text-xs font-bold uppercase tracking-wider py-2 md:py-3 cursor-pointer">
                    All Areas
                  </SelectItem>
                  
                  {/* Map over the actual database locations dynamically */}
                  {availableAreas.map((area) => (
                    <SelectItem key={area} value={area} className="text-[9px] md:text-xs font-bold uppercase tracking-wider py-2 md:py-3 cursor-pointer">
                      {area}
                    </SelectItem>
                  ))}
                  
                </SelectContent>
              </Select>
            </div>

            {/* Results Count Counter */}
            <div className="hidden sm:flex items-center pl-2 md:pl-4 border-l-2 border-zinc-200/60 shrink-0">
              <span className="text-sm md:text-2xl font-black text-black leading-none">
                {totalAssets}
              </span>
              <span className="text-[8px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 md:ml-2 leading-tight">
                Assets
                <br />
                Found
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* === Dynamic Property Grid === */}
      <div className="max-w-7xl mx-auto px-2 md:px-4 pt-28 md:pt-24 sm:px-6 lg:px-8 min-h-[300px] md:min-h-[500px] w-full box-border">
        {items.length > 0 ? (
          <>
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-6 md:gap-y-12 w-full min-w-0 box-border"
            >
              <AnimatePresence mode="popLayout">
                {items.map((property: any, index: number) => (
                  <motion.div
                    key={`${property.id}-${index}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full min-w-0 box-border"
                  >
                    <PropertyCard property={property} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* === Load More Action === */}
            <AnimatePresence>
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-16 md:mt-24 flex justify-center"
                >
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="px-10 py-4 bg-transparent text-primary font-bold uppercase tracking-widest text-xs border-2 border-black hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                       <>
                <HugeiconsIcon icon={Loading03FreeIcons} className="size-4 animate-spin" /> loading properties
                </>
                    ) : (
                      <>
                        show more properties
                        <HugeiconsIcon
                          icon={ArrowDown01Icon}
                          size={16}
                          className="group-hover:translate-y-1 transition-transform"
                        />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          // === Empty State ===
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center text-center py-16 md:py-32 w-full box-border"
          >
            <div className="w-12 h-12 md:w-20 md:h-20 bg-zinc-50/50 rounded-full flex items-center justify-center mb-3 md:mb-6 border border-zinc-200/60 shrink-0">
              <span className="scale-75 md:scale-100 flex items-center">
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={32}
                  className="text-zinc-300"
                />
              </span>
            </div>
            <h3 className="text-lg md:text-2xl font-black text-black uppercase tracking-tight mb-1 md:mb-2 break-words">
              No Assets Found
            </h3>
            <p className="text-[10px] md:text-sm text-zinc-500 font-medium mb-4 md:mb-8 max-w-xs md:max-w-sm px-2 break-words leading-relaxed">
              We currently do not have any properties matching your exact
              specifications in our portfolio.
            </p>
            <button
              onClick={() => {
                router.push("/properties", { scroll: false });
              }}
              className="px-4 py-2.5 md:px-8 md:py-4 bg-black text-white font-bold uppercase tracking-widest text-[9px] md:text-xs hover:bg-zinc-800 transition-colors duration-300 shrink-0"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
