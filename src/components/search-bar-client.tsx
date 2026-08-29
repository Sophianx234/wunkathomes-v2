"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { getDynamicSearchFacets } from "@/actions/public/search.action";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  Building01Icon,
  Home01Icon,
  House01Icon,
  House03Icon,
  Key01Icon,
  Location01Icon,
  MapingIcon,
  Search01Icon,
  Store01Icon,
  Tag01Icon,
  TagsIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface SearchBarClientProps {
  availableAreas: string[];
  availableTypes: string[];
}

// Map the raw DB enums to beautiful UI labels and icons
const getTypeDetails = (type: string) => {
  switch (type) {
    case 'Apartment_Building': return { label: 'Apartment', icon: Building01Icon };
    case 'Commercial': return { label: 'Commercial Property', icon: Store01Icon };
    case 'House': return { label: 'House', icon: Home01Icon };
    case 'Land': return { label: 'Land', icon: MapingIcon };
    default: return { label: type.replace(/_/g, ' '), icon: House01Icon };
  }
};

export default function SearchBarClient({ availableAreas, availableTypes }: SearchBarClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    propertyType: searchParams.get("type") || searchParams.get("propertyType") || "",
    location: searchParams.get("location") || "",
    status: searchParams.get("status") || "",
  });

  useEffect(() => {
    setFilters({
      propertyType: searchParams.get("type") || searchParams.get("propertyType") || "",
      location: searchParams.get("location") || "",
      status: searchParams.get("status") || "",
    });
  }, [searchParams]);
  const [dynamicAreas, setDynamicAreas] = useState<string[]>(availableAreas);
  const [dynamicTypes, setDynamicTypes] = useState<string[]>(availableTypes);
  const [dynamicStatuses, setDynamicStatuses] = useState<string[]>(["For_Rent", "For_Sale"]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const facets = await getDynamicSearchFacets(filters);
      setDynamicAreas(facets.availableAreas);
      setDynamicTypes(facets.availableTypes);
      if (facets.availableStatuses.length > 0) {
        setDynamicStatuses(facets.availableStatuses);
      }
    });
  }, [filters]);

  const handleSelectChange = (name: string, value: string) => {
    const val = value === "all" ? "" : value;
    setFilters((prev) => ({ ...prev, [name]: val }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (filters.propertyType) params.append("type", filters.propertyType);
    if (filters.location) params.append("location", filters.location);
    if (filters.status) params.append("status", filters.status);

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <section className="relative z-10 -mt-10 md:-mt-16 px-2 md:px-4 sm:px-6 w-full overflow-x-hidden box-border">
      <motion.form
        onSubmit={handleSearch}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto w-full min-w-0 max-w-full box-border bg-white shadow-[0_6px_20px_rgba(0,0,0,0.06)] md:shadow-[0_12px_40px_rgba(0,0,0,0.06)] rounded-lg md:rounded-full p-1.5 md:p-2 flex flex-col md:flex-row md:items-center border border-zinc-200/60 md:divide-x md:divide-zinc-100"
      >
        {/* 1. Property Type Dropdown */}
        <div className="flex items-center gap-2 md:gap-3 flex-1 w-full min-w-0 max-w-full box-border px-3 py-2 md:px-5 md:py-3 hover:bg-zinc-50/80 rounded-t-xl md:rounded-r-none md:rounded-l-full transition-colors group cursor-pointer border-b md:border-b-0 border-zinc-200/60">
          <span className="scale-75 md:scale-100 flex items-center shrink-0">
            <HugeiconsIcon
              icon={House03Icon}
              size={22}
              className="text-zinc-400 group-hover:text-zinc-900 transition-colors"
            />
          </span>
          <div className="flex flex-col w-full min-w-0 box-border">
            <label className="text-[8px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0 md:mb-0.5 truncate">
              Property Type
            </label>
            <Select
              value={filters.propertyType || "all"}
              onValueChange={(val) => handleSelectChange("propertyType", val)}
            >
              <SelectTrigger className="w-full min-w-0 max-w-full box-border border-0 p-0 h-auto bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 text-zinc-800 font-semibold text-xs md:text-sm outline-none [&_.dropdown-icon]:hidden truncate">
                <SelectValue placeholder="What type?" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-zinc-200/80 shadow-sm rounded-lg p-0 w-[calc(100vw-2rem)] md:w-full min-w-[var(--radix-select-trigger-width)]">
                <div className="divide-y divide-zinc-100 flex flex-col w-full box-border">
                  <SelectItem value="all" className="cursor-pointer w-full [&>span]:w-full text-[10px] md:text-xs font-medium py-2 md:py-2.5 focus:bg-zinc-50 box-border">
                    <div className="flex w-full text-zinc-700 justify-between items-center pr-1 min-w-0 box-border">
                      <span className="truncate">All Types</span>
                      <span className="scale-75 md:scale-100 flex items-center shrink-0"><HugeiconsIcon icon={House01Icon} size={14} className="text-zinc-400 dropdown-icon" /></span>
                    </div>
                  </SelectItem>
                  
                  {/* Dynamic Database Values */}
                  {dynamicTypes.map((type) => {
                    const { label, icon: Icon } = getTypeDetails(type);
                    return (
                      <SelectItem key={type} value={type} className="cursor-pointer w-full [&>span]:w-full text-[10px] md:text-xs font-medium py-2 md:py-2.5 focus:bg-zinc-50 box-border">
                        <div className="flex w-full text-zinc-700 justify-between items-center pr-1 min-w-0 box-border">
                          <span className="truncate">{label}</span>
                          <span className="scale-75 md:scale-100 flex items-center shrink-0"><HugeiconsIcon icon={Icon} size={14} className="text-zinc-400 dropdown-icon" /></span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 2. Location Dropdown */}
        <div className="flex items-center gap-2 md:gap-3 flex-1 w-full min-w-0 max-w-full box-border px-3 py-2 md:px-5 md:py-3 hover:bg-zinc-50/80 rounded-none transition-colors group cursor-pointer border-b md:border-b-0 border-zinc-200/60">
          <span className="scale-75 md:scale-100 flex items-center shrink-0">
            <HugeiconsIcon
              icon={MapingIcon}
              size={22}
              className="text-zinc-400 group-hover:text-zinc-900 transition-colors"
            />
          </span>
          <div className="flex flex-col w-full min-w-0 box-border">
            <label className="text-[8px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0 md:mb-0.5 truncate">
              Location
            </label>
            <Select
              value={filters.location || "all"}
              onValueChange={(val) => handleSelectChange("location", val)}
            >
              <SelectTrigger className="w-full min-w-0 max-w-full box-border border-0 p-0 h-auto bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 text-zinc-800 font-semibold text-xs md:text-sm outline-none [&_.dropdown-icon]:hidden truncate">
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-zinc-200/80 shadow-sm rounded-lg p-0 w-[calc(100vw-2rem)] md:w-full min-w-[var(--radix-select-trigger-width)]">
                <div className="divide-y divide-zinc-100 flex flex-col w-full box-border">
                  <SelectGroup className="w-full divide-y divide-zinc-100 flex flex-col box-border">
                    <SelectItem value="all" className="cursor-pointer w-full [&>span]:w-full text-[10px] md:text-xs font-medium py-2 md:py-2.5 focus:bg-zinc-50 box-border">
                      <div className="flex w-full justify-between items-center pr-1 text-zinc-700 min-w-0 box-border">
                        <span className="truncate">All Locations</span>
                        <span className="scale-75 md:scale-100 flex items-center shrink-0"><HugeiconsIcon icon={Location01Icon} size={14} className="text-zinc-400 dropdown-icon" /></span>
                      </div>
                    </SelectItem>
                    
                    {dynamicAreas.length > 0 && (
                      <div className="bg-zinc-50/60 py-1 px-2 md:px-3 w-full box-border">
                        <SelectLabel className="text-[7px] md:text-[9px] uppercase tracking-widest text-zinc-400 font-bold p-0 m-0 truncate">
                          Active Areas
                        </SelectLabel>
                      </div>
                    )}
                    
                    {/* Dynamic Database Values */}
                    {dynamicAreas.map((area) => (
                      <SelectItem key={area} value={area} className="cursor-pointer w-full [&>span]:w-full text-[10px] md:text-xs font-medium py-2 md:py-2.5 focus:bg-zinc-50 box-border">
                        <div className="flex w-full justify-between items-center pr-1 text-zinc-700 min-w-0 box-border">
                          <span className="truncate">{area}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 3. Status Dropdown (Rent/Sale) */}
        <div className="flex items-center gap-2 md:gap-3 flex-1 w-full min-w-0 max-w-full box-border px-3 py-2 md:px-5 md:py-3 hover:bg-zinc-50/80 rounded-none md:rounded-r-full transition-colors group cursor-pointer border-b md:border-b-0 border-zinc-200/60">
          <span className="scale-75 md:scale-100 flex items-center shrink-0">
            <HugeiconsIcon
              icon={TagsIcon}
              size={22}
              className="text-zinc-400 group-hover:text-zinc-900 transition-colors"
            />
          </span>
          <div className="flex flex-col w-full min-w-0 box-border">
            <label className="text-[8px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0 md:mb-0.5 truncate">
              Status
            </label>
            <Select
              value={filters.status || "all"}
              onValueChange={(val) => handleSelectChange("status", val)}
            >
              <SelectTrigger className="w-full min-w-0 max-w-full box-border border-0 p-0 h-auto bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 text-zinc-800 font-semibold text-xs md:text-sm outline-none [&_.dropdown-icon]:hidden truncate">
                <SelectValue placeholder="Rent or Sale?" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-zinc-200/80 shadow-sm rounded-lg p-0 w-[calc(100vw-2rem)] md:w-full min-w-[var(--radix-select-trigger-width)]">
                <div className="divide-y divide-zinc-100 flex flex-col w-full box-border">
                  <SelectItem value="all" className="cursor-pointer w-full [&>span]:w-full text-[10px] md:text-xs font-medium py-2 md:py-2.5 focus:bg-zinc-50 box-border">
                    <div className="flex w-full justify-between items-center pr-1 text-zinc-700 min-w-0 box-border">
                      <span className="truncate">Any Status</span>
                      <span className="scale-75 md:scale-100 flex items-center shrink-0"><HugeiconsIcon icon={Tag01Icon} size={14} className="text-zinc-400 dropdown-icon" /></span>
                    </div>
                  </SelectItem>
                  <SelectItem value="For_Rent" className="cursor-pointer w-full [&>span]:w-full text-[10px] md:text-xs font-medium py-2 md:py-2.5 focus:bg-zinc-50 box-border">
                    <div className="flex w-full justify-between items-center pr-1 text-zinc-700 min-w-0 box-border">
                      <span className="truncate">For Rent</span>
                      <span className="scale-75 md:scale-100 flex items-center shrink-0"><HugeiconsIcon icon={Key01Icon} size={14} className="text-zinc-800 dropdown-icon" /></span>
                    </div>
                  </SelectItem>
                  <SelectItem value="For_Sale" className="cursor-pointer w-full [&>span]:w-full text-[10px] md:text-xs font-medium py-2 md:py-2.5 focus:bg-zinc-50 box-border">
                    <div className="flex w-full justify-between items-center pr-1 text-zinc-700 min-w-0 box-border">
                      <span className="truncate">For Sale</span>
                      <span className="scale-75 md:scale-100 flex items-center shrink-0"><HugeiconsIcon icon={Tag01Icon} size={14} className="text-zinc-800 dropdown-icon" /></span>
                    </div>
                  </SelectItem>
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Submission CTA */}
        <div className="p-1 md:p-1.5 w-full md:w-auto mt-1 md:mt-0 box-border shrink-0">
          <Button
            type="submit"
            className="w-full md:w-auto bg-zinc-950 text-white hover:bg-zinc-800 px-4 py-3 md:px-7 md:py-5.5 rounded-b-xl md:rounded-full flex items-center justify-center gap-1.5 md:gap-2 font-semibold text-xs md:text-sm shadow-sm transition-transform active:scale-95 m-0"
          >
            <span className="scale-75 md:scale-100 flex items-center shrink-0"><HugeiconsIcon icon={Search01Icon} size={16} /></span>
            <span>Search</span>
          </Button>
        </div>
      </motion.form>
    </section>
  );
}


