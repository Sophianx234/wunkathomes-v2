"use client";

import {
  ArrowDown01Icon,
  Location01Icon,
  Search01Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import PropertyCard from "@/components/property-card";

// --- Types & Constants ---
const PROPERTY_TYPES = ["All", "House", "Apartment", "Commercial", "Land"];
const ITEMS_PER_PAGE = 8; 

interface PropertiesClientProps {
  inventory: any[]; // Matches the mapped data from the server
  availableAreas: string[];
}

export default function PropertiesClient({ inventory, availableAreas }: PropertiesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for filters
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // State for pagination
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Sync state with URL on mount and when URL changes
  useEffect(() => {
    const typeFromUrl = searchParams.get("type");
    const statusFromUrl = searchParams.get("status");
    const locationFromUrl = searchParams.get("location");

    if (
      typeFromUrl &&
      PROPERTY_TYPES.map((t) => t.toLowerCase()).includes(
        typeFromUrl.toLowerCase(),
      )
    ) {
      setTypeFilter(typeFromUrl.charAt(0).toUpperCase() + typeFromUrl.slice(1));
    }
    if (statusFromUrl) setStatusFilter(statusFromUrl);
    if (locationFromUrl) setLocationFilter(locationFromUrl);
  }, [searchParams]);

  // Reset pagination to initial count whenever a filter is changed
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [typeFilter, statusFilter, locationFilter]);

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
    setTypeFilter(type);
    updateUrl("type", type);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 4); 
  };

  // Derived state: Filtered properties (All that match)
  const filteredProperties = useMemo(() => {
    return inventory.filter((item) => {
      // 1. Check Property Type
      const matchType =
        typeFilter === "All" ||
        item.property.propertyType.toLowerCase() === typeFilter.toLowerCase();

      // 2. Check Status (Rent vs Sale)
      const matchStatus =
        statusFilter === "all" || item.listingType.toLowerCase() === statusFilter.toLowerCase();

      // 3. Check Location
      const matchLocation =
        locationFilter === "all" || item.property.location.toLowerCase() === locationFilter.toLowerCase();

      return matchType && matchStatus && matchLocation;
    });
  }, [inventory, typeFilter, statusFilter, locationFilter]);

  // Derived state: Displayed properties (Paginated subset)
  const displayedProperties = filteredProperties.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProperties.length;

  return (
    <div className="bg-white min-h-screen  pb-24">
      {/* === Sticky Glassmorphism Filter Bar === */}
      <div className="sticky top-[5rem] z-40 bg-white/80 backdrop-blur-xl border-y border-slate-200 shadow-sm mb-12 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Left: Property Type Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar mask-fade-right">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  typeFilter === type
                    ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] -translate-y-[1px]"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-black"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Right: Dropdown Filters & Count */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Dropdown */}
            <div className="w-[160px]">
              <Select
                onValueChange={(val) => {
                  setStatusFilter(val);
                  updateUrl("status", val);
                }}
                value={statusFilter}
              >
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-full h-11 text-xs font-bold uppercase tracking-widest focus:ring-0 focus:ring-offset-0 [&_.dropdown-icon]:hidden">
                  <HugeiconsIcon
                    icon={Tag01Icon}
                    size={16}
                    className="text-slate-400 mr-2 dropdown-icon"
                  />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl">
                  <SelectItem value="all" className="text-xs font-bold uppercase tracking-wider py-3 cursor-pointer">
                    All Statuses
                  </SelectItem>
                  <SelectItem value="For_Rent" className="text-xs font-bold uppercase tracking-wider py-3 cursor-pointer">
                    For Rent
                  </SelectItem>
                  <SelectItem value="For_Sale" className="text-xs font-bold uppercase tracking-wider py-3 cursor-pointer">
                    For Sale
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Dropdown */}
            <div className="w-[180px]">
              <Select
                onValueChange={(val) => {
                  setLocationFilter(val);
                  updateUrl("location", val);
                }}
                value={locationFilter}
              >
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-full h-11 text-xs font-bold uppercase tracking-widest focus:ring-0 focus:ring-offset-0 [&_.dropdown-icon]:hidden">
                  <HugeiconsIcon
                    icon={Location01Icon}
                    size={16}
                    className="text-slate-400 mr-2 dropdown-icon"
                  />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl">
                  <SelectItem value="all" className="text-xs font-bold uppercase tracking-wider py-3 cursor-pointer">
                    All Areas
                  </SelectItem>
                  
                  {/* Map over the actual database locations dynamically */}
                  {availableAreas.map((area) => (
                    <SelectItem key={area} value={area} className="text-xs font-bold uppercase tracking-wider py-3 cursor-pointer">
                      {area}
                    </SelectItem>
                  ))}
                  
                </SelectContent>
              </Select>
            </div>

            {/* Results Count Counter */}
            <div className="hidden md:flex items-center pl-4 border-l-2 border-slate-200">
              <span className="text-2xl font-black text-black leading-none">
                {filteredProperties.length}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 leading-tight">
                Assets
                <br />
                Found
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* === Dynamic Property Grid === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[500px]">
        {displayedProperties.length > 0 ? (
          <>
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12"
            >
              <AnimatePresence mode="popLayout">
                {displayedProperties.map((property) => (
                  <motion.div
                    key={property.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
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
                    className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs border-2 border-black hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center gap-3 group"
                  >
                    Load More Properties
                    <HugeiconsIcon
                      icon={ArrowDown01Icon}
                      size={16}
                      className="group-hover:translate-y-1 transition-transform"
                    />
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
            className="flex flex-col items-center justify-center text-center py-32"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
              <HugeiconsIcon
                icon={Search01Icon}
                size={32}
                className="text-slate-300"
              />
            </div>
            <h3 className="text-2xl font-black text-black uppercase tracking-tight mb-2">
              No Assets Found
            </h3>
            <p className="text-slate-500 font-medium mb-8 max-w-sm">
              We currently do not have any properties matching your exact
              specifications in our portfolio.
            </p>
            <button
              onClick={() => {
                setTypeFilter("All");
                setStatusFilter("all");
                setLocationFilter("all");
                router.push("/properties", { scroll: false });
              }}
              className="px-8 py-4 bg-black text-white font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors duration-300"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}