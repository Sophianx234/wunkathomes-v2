"use client";

import { Search01Icon, FilterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterView: string;
  setFilterView: (val: any) => void;
  resultsCount: number;
}

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  filterView,
  setFilterView,
  resultsCount,
}: FilterBarProps) {
  return (
    <section className="flex flex-col xl:flex-row items-center gap-4 bg-white p-1.5 border border-zinc-200/60 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.01)] w-full">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <Input 
          placeholder="Search by WhatsApp number, property, or title..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] bg-transparent shadow-none placeholder:text-zinc-400 font-medium"
        />
      </div>

      <div className="h-4 w-px bg-zinc-200 hidden xl:block" />

      {/* Dropdowns & Counter Section */}
      <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full xl:w-auto px-2 pb-1 xl:pb-0">
        
        {/* View Filter */}
        <Select value={filterView} onValueChange={setFilterView}>
          <SelectTrigger className="w-full md:w-[140px] h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">Upcoming Tours</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="no_show">No Shows</SelectItem>
            <SelectItem value="all">All Tours</SelectItem>
          </SelectContent>
        </Select>

        {/* Location Dropdown (Placeholder for future dynamic locations) */}
        <Select defaultValue="all">
          <SelectTrigger className="w-full md:w-[140px] h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Areas</SelectItem>
          </SelectContent>
        </Select>

        <div className="h-4 w-px bg-zinc-200 hidden md:block mx-1" />

        {/* Results Counter */}
        <div className="hidden md:flex items-center gap-2 pl-1 pr-2">
          <span className="text-[18px] font-semibold tracking-tighter text-zinc-900 leading-none font-tabular-nums">
            {resultsCount}
          </span>
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">
            Leads
          </span>
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 shrink-0 ml-auto md:ml-0 rounded-md">
          <HugeiconsIcon icon={FilterIcon} size={14} />
        </Button>
      </div>
    </section>
  );
}