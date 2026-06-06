"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useTransition, useState, useEffect } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  Search01Icon,
  FilterIcon,
  ReloadIcon, // Assuming you want a reset icon, or you can just use text
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PropertiesFilterBarProps {
  totalAssets: number;
}

export default function PropertiesFilterBar({
  totalAssets,
}: PropertiesFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for the search input so we can clear it reliably on reset
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const debounceTimerRef = useRef<NodeJS.Timeout>(null);

  // Sync local search term if URL changes from outside
  useEffect(() => {
    setSearchTerm(searchParams.get("q") || "");
  }, [searchParams]);

  // Helper to securely update the URL parameters
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams],
  );

  const handleFilterChange = (key: string, value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString(key, value)}`);
    });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term); // Update input UI immediately
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      handleFilterChange("q", term);
    }, 600); // 600ms debounce prevents spamming the server while typing
  };

  // Reset function to clear all filters
  const handleReset = () => {
    startTransition(() => {
      setSearchTerm(""); // Clear search box
      router.push(pathname); // Pushing just the pathname clears the query string
    });
  };

  const currentAssetType = searchParams.get("assetType") || "all";

  // Check if there are any active filters to determine if we should show the reset button
  const hasActiveFilters = Array.from(searchParams.keys()).length > 0;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* --- TOP ROW: Property Type Pills & Action Button --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Property Type Pills (Horizontal Scroll on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => handleFilterChange("assetType", "all")}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              currentAssetType === "all"
                ? "bg-black text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            All Assets
          </button>
          <button
            onClick={() =>
              handleFilterChange("assetType", "Apartment_Building")
            }
            className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              currentAssetType === "Apartment_Building"
                ? "bg-black text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            Apartments
          </button>
          <button
            onClick={() => handleFilterChange("assetType", "Commercial")}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              currentAssetType === "Commercial"
                ? "bg-black text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            Commercial
          </button>
          <button
            onClick={() => handleFilterChange("assetType", "House")}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              currentAssetType === "House"
                ? "bg-black text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            Houses
          </button>
        </div>

        {/* Create Property Button */}
        <Link
          href="/admin/properties/create"
          className="text-white flex items-center bg-black hover:bg-slate-800 rounded-lg h-10 px-5 text-[14px] font-medium shrink-0 w-full md:w-auto transition-colors"
        >
          <HugeiconsIcon
            icon={PlusSignIcon}
            size={18}
            strokeWidth={2}
            className="mr-2"
          />
          Create Property
        </Link>
      </div>

      {/* --- BOTTOM ROW: Unified Search & Filter Chrome --- */}
      <section className="flex flex-col xl:flex-row items-center gap-4 bg-white p-2 border border-slate-200 rounded-xl w-full">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            strokeWidth={2}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            value={searchTerm} // Now controlled
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by title, location, or slug..."
            className="w-full pl-10 h-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[14px] bg-transparent shadow-none"
          />
        </div>

        <div className="h-6 w-px bg-slate-200 hidden xl:block" />

        {/* Dropdowns & Counter Section */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full xl:w-auto px-2 pb-2 xl:pb-0">
          {/* 1. Location Dropdown (Using value instead of defaultValue) */}
          <Select
            value={searchParams.get("location") || "all"}
            onValueChange={(val) => handleFilterChange("location", val)}
          >
            <SelectTrigger className="w-full md:w-[140px] h-9 border-0 bg-slate-50 hover:bg-slate-100 text-[13px] font-medium text-slate-700 shadow-none focus:ring-0">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              <SelectItem value="east_legon">East Legon</SelectItem>
              <SelectItem value="cantonments">Cantonments</SelectItem>
              <SelectItem value="airport_res">Airport Res.</SelectItem>
            </SelectContent>
          </Select>

          {/* 2. Listing Type Dropdown */}
          <Select
            value={searchParams.get("listingType") || "all"}
            onValueChange={(val) => handleFilterChange("listingType", val)}
          >
            <SelectTrigger className="w-full md:w-[130px] h-9 border-0 bg-slate-50 hover:bg-slate-100 text-[13px] font-medium text-slate-700 shadow-none focus:ring-0">
              <SelectValue placeholder="Listing Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="For_Rent">For Rent</SelectItem>
              <SelectItem value="For_Sale">For Sale</SelectItem>
            </SelectContent>
          </Select>

          {/* 3. Status Dropdown */}
          <Select
            value={searchParams.get("status") || "all"}
            onValueChange={(val) => handleFilterChange("status", val)}
          >
            <SelectTrigger className="w-full md:w-[130px] h-9 border-0 bg-slate-50 hover:bg-slate-100 text-[13px] font-medium text-slate-700 shadow-none focus:ring-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Rented">Rented</SelectItem>
              <SelectItem value="Sold">Sold</SelectItem>
            </SelectContent>
          </Select>

          {/* Vertical Separator */}
          <div className="h-6 w-px bg-slate-200 hidden md:block mx-1" />

          {/* 4. Results Counter */}
          <div
            className={`hidden md:flex items-center gap-2 pl-1 pr-2 transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
          >
            <span className="text-[22px] font-black text-slate-900 leading-none">
              {totalAssets}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
              Assets
              <br />
              Found
            </span>
          </div>

          {/* Reset Filters Button (Shows only when filters are active) */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleReset}
              className="h-9 px-3 text-[13px] font-medium  rounded-sm py-1 shadow-xs bg-white text-black shrink-0 transition-colors"
            >
              Reset
            </Button>
          )}

          {/* Advanced Filter Icon Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100 shrink-0 ml-auto md:ml-0"
          >
            <HugeiconsIcon icon={FilterIcon} size={18} strokeWidth={2} />
          </Button>
        </div>
      </section>
    </div>
  );
}
