"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
    propertyType: searchParams.get("propertyType") || "",
    location: searchParams.get("location") || "",
    status: searchParams.get("status") || "",
  });

  useEffect(() => {
    setFilters({
      propertyType: searchParams.get("propertyType") || "",
      location: searchParams.get("location") || "",
      status: searchParams.get("status") || "",
    });
  }, [searchParams]);

  const handleSelectChange = (name: string, value: string) => {
    const val = value === "all" ? "" : value;
    setFilters((prev) => ({ ...prev, [name]: val }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (filters.propertyType) params.append("propertyType", filters.propertyType);
    if (filters.location) params.append("location", filters.location);
    if (filters.status) params.append("status", filters.status);

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <section className="relative z-10 -mt-16 px-4 sm:px-6">
      <motion.form
        onSubmit={handleSearch}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] rounded-3xl md:rounded-full p-2 flex flex-col md:flex-row md:items-center border border-zinc-100 md:divide-x md:divide-zinc-100"
      >
        {/* 1. Property Type Dropdown */}
        <div className="flex items-center gap-3 flex-1 px-5 py-3 hover:bg-zinc-50/80 rounded-full md:rounded-r-none md:rounded-l-full transition-colors group cursor-pointer border-b md:border-b-0 border-zinc-100">
          <HugeiconsIcon
            icon={House03Icon}
            size={22}
            className="text-zinc-400 group-hover:text-zinc-900 transition-colors shrink-0"
          />
          <div className="flex flex-col w-full">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
              Property Type
            </label>
            <Select
              value={filters.propertyType || "all"}
              onValueChange={(val) => handleSelectChange("propertyType", val)}
            >
              <SelectTrigger className="w-full border-0 p-0 h-auto bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 text-zinc-800 font-semibold text-sm outline-none [&_.dropdown-icon]:hidden">
                <SelectValue placeholder="What type?" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-zinc-200/80 shadow-xl rounded-xl p-0 w-full min-w-[var(--radix-select-trigger-width)]">
                <div className="divide-y divide-zinc-100 flex flex-col w-full">
                  <SelectItem value="all" className="cursor-pointer w-full [&>span]:w-full text-xs font-medium py-2.5 focus:bg-zinc-50">
                    <div className="flex w-full text-zinc-700 justify-between items-center pr-1">
                      <span>All Types</span>
                      <HugeiconsIcon icon={House01Icon} size={14} className="text-zinc-400 dropdown-icon" />
                    </div>
                  </SelectItem>
                  
                  {/* Dynamic Database Values */}
                  {availableTypes.map((type) => {
                    const { label, icon: Icon } = getTypeDetails(type);
                    return (
                      <SelectItem key={type} value={type} className="cursor-pointer w-full [&>span]:w-full text-xs font-medium py-2.5 focus:bg-zinc-50">
                        <div className="flex w-full text-zinc-700 justify-between items-center pr-1">
                          <span>{label}</span>
                          <HugeiconsIcon icon={Icon} size={14} className="text-zinc-400 dropdown-icon" />
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
        <div className="flex items-center gap-3 flex-1 px-5 py-3 hover:bg-zinc-50/80 rounded-none transition-colors group cursor-pointer border-b md:border-b-0 border-zinc-100">
          <HugeiconsIcon
            icon={MapingIcon}
            size={22}
            className="text-zinc-400 group-hover:text-zinc-900 transition-colors shrink-0"
          />
          <div className="flex flex-col w-full">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
              Location
            </label>
            <Select
              value={filters.location || "all"}
              onValueChange={(val) => handleSelectChange("location", val)}
            >
              <SelectTrigger className="w-full border-0 p-0 h-auto bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 text-zinc-800 font-semibold text-sm outline-none [&_.dropdown-icon]:hidden">
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-zinc-200/80 shadow-xl rounded-xl p-0 w-full min-w-[var(--radix-select-trigger-width)]">
                <div className="divide-y divide-zinc-100 flex flex-col w-full">
                  <SelectGroup className="w-full divide-y divide-zinc-100 flex flex-col">
                    <SelectItem value="all" className="cursor-pointer w-full [&>span]:w-full text-xs font-medium py-2.5 focus:bg-zinc-50">
                      <div className="flex w-full justify-between items-center pr-1 text-zinc-700">
                        <span>All Locations</span>
                        <HugeiconsIcon icon={Location01Icon} size={14} className="text-zinc-400 dropdown-icon" />
                      </div>
                    </SelectItem>
                    
                    {availableAreas.length > 0 && (
                      <div className="bg-zinc-50/60 py-1 px-3">
                        <SelectLabel className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold p-0 m-0">
                          Active Areas
                        </SelectLabel>
                      </div>
                    )}
                    
                    {/* Dynamic Database Values */}
                    {availableAreas.map((area) => (
                      <SelectItem key={area} value={area} className="cursor-pointer w-full [&>span]:w-full text-xs font-medium py-2.5 focus:bg-zinc-50">
                        <div className="flex w-full justify-between items-center pr-1 text-zinc-700">
                          <span>{area}</span>
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
        <div className="flex items-center gap-3 flex-1 px-5 py-3 hover:bg-zinc-50/80 rounded-full md:rounded-l-none transition-colors group cursor-pointer border-b md:border-b-0 border-zinc-100">
          <HugeiconsIcon
            icon={TagsIcon}
            size={22}
            className="text-zinc-400 group-hover:text-zinc-900 transition-colors shrink-0"
          />
          <div className="flex flex-col w-full">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
              Status
            </label>
            <Select
              value={filters.status || "all"}
              onValueChange={(val) => handleSelectChange("status", val)}
            >
              <SelectTrigger className="w-full border-0 p-0 h-auto bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 text-zinc-800 font-semibold text-sm outline-none [&_.dropdown-icon]:hidden">
                <SelectValue placeholder="Rent or Sale?" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-zinc-200/80 shadow-xl rounded-xl p-0 w-full min-w-[var(--radix-select-trigger-width)]">
                <div className="divide-y divide-zinc-100 flex flex-col w-full">
                  <SelectItem value="all" className="cursor-pointer w-full [&>span]:w-full text-xs font-medium py-2.5 focus:bg-zinc-50">
                    <div className="flex w-full justify-between items-center pr-1 text-zinc-700">
                      <span>Any Status</span>
                      <HugeiconsIcon icon={Tag01Icon} size={14} className="text-zinc-400 dropdown-icon" />
                    </div>
                  </SelectItem>
                  <SelectItem value="For_Rent" className="cursor-pointer w-full [&>span]:w-full text-xs font-medium py-2.5 focus:bg-zinc-50">
                    <div className="flex w-full justify-between items-center pr-1 text-zinc-700">
                      <span>For Rent</span>
                      <HugeiconsIcon icon={Key01Icon} size={14} className="text-zinc-800 dropdown-icon" />
                    </div>
                  </SelectItem>
                  <SelectItem value="For_Sale" className="cursor-pointer w-full [&>span]:w-full text-xs font-medium py-2.5 focus:bg-zinc-50">
                    <div className="flex w-full justify-between items-center pr-1 text-zinc-700">
                      <span>For Sale</span>
                      <HugeiconsIcon icon={Tag01Icon} size={14} className="text-zinc-800 dropdown-icon" />
                    </div>
                  </SelectItem>
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Submission CTA */}
        <div className="p-1.5 w-full md:w-auto mt-2 md:mt-0">
          <Button
            type="submit"
            className="w-full md:w-auto bg-zinc-950 text-white hover:bg-zinc-800 px-7 py-5.5 rounded-full flex items-center justify-center gap-2 font-semibold text-sm shadow-sm transition-transform active:scale-95"
          >
            <HugeiconsIcon icon={Search01Icon} size={16} />
            <span>Search</span>
          </Button>
        </div>
      </motion.form>
    </section>
  );
}