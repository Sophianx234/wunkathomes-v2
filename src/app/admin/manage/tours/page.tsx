"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  Search01Icon, 
  FilterIcon, 
  WhatsappIcon,
  Calendar01Icon,
  Clock01Icon,
  Location01Icon,
  LinkSquare01Icon,
  Building03Icon,
  BedSingle01Icon,
  Bathtub01Icon, // Fixed from Bath01Icon
  Maximize01Icon,
  Copy01Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

// --- TYPES (Mapped from Mongoose Schemas) ---
type TourStatus = "Pending_Time" | "Confirmed" | "Completed" | "No_Show" | "Converted";

interface TourRecord {
  id: string;
  phoneNumber: string;
  scheduledDate: string; // ISO String
  confirmedTime?: string; // e.g., "14:30"
  status: TourStatus;
  notes: string;
  listing: {
    id: string;
    title: string;
    price: number;
    listingType: "For_Rent" | "For_Sale";
    property: {
      propertyName: string;
      location: string;
    };
    features: {
      bedrooms: number;
      bathrooms: number;
      sizeSqm: number;
    };
    image: string;
  };
}

// --- UTILS & MOCK DATA ---
const generateMockDates = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 5);
  const past = new Date(today);
  past.setDate(past.getDate() - 2);

  return { today: today.toISOString(), tomorrow: tomorrow.toISOString(), nextWeek: nextWeek.toISOString(), past: past.toISOString() };
};

const DATES = generateMockDates();

const MOCK_TOURS: TourRecord[] = [
  {
    id: "tour_001",
    phoneNumber: "+233 54 123 4567",
    scheduledDate: DATES.today,
    status: "Pending_Time",
    notes: "",
    listing: {
      id: "LST-991",
      title: "Master Bedroom with Balcony",
      price: 12000,
      listingType: "For_Rent",
      property: { propertyName: "The Heights", location: "East Legon, Accra" },
      features: { bedrooms: 1, bathrooms: 1, sizeSqm: 45 },
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=400&auto=format&fit=crop"
    }
  },
  {
    id: "tour_002",
    phoneNumber: "+233 20 987 6543",
    scheduledDate: DATES.tomorrow,
    confirmedTime: "14:00",
    status: "Confirmed",
    notes: "Client mentioned they are looking to move in by 1st of next month.",
    listing: {
      id: "LST-882",
      title: "Luxury 3-Bedroom Suite",
      price: 45000,
      listingType: "For_Rent",
      property: { propertyName: "Cantonments Villas", location: "Cantonments, Accra" },
      features: { bedrooms: 3, bathrooms: 3, sizeSqm: 180 },
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&auto=format&fit=crop"
    }
  },
  {
    id: "tour_003",
    phoneNumber: "+233 24 555 8899",
    scheduledDate: DATES.past,
    confirmedTime: "10:30",
    status: "Completed",
    notes: "Loved the kitchen. Waiting on their partner to confirm before deposit.",
    listing: {
      id: "LST-441",
      title: "Studio Apartment",
      price: 6000,
      listingType: "For_Rent",
      property: { propertyName: "Osu Prime", location: "Osu, Accra" },
      features: { bedrooms: 1, bathrooms: 1, sizeSqm: 35 },
      image: "https://images.unsplash.com/photo-1621360841013-c76831f1e35d?q=80&w=400&auto=format&fit=crop"
    }
  }
];

const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

  if (isToday) return `Today, ${formattedDate}`;
  if (isTomorrow) return `Tomorrow, ${formattedDate}`;
  return formattedDate;
};

const formatCurrency = (amount: number) => `GH₵ ${amount.toLocaleString()}`;

const getStatusBadge = (status: TourStatus) => {
  const styles = {
    Pending_Time: "bg-amber-50/80 text-amber-700 ring-1 ring-amber-300/60",
    Confirmed: "bg-emerald-50/80 text-emerald-700 ring-1 ring-emerald-200/60",
    Completed: "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200/80",
    No_Show: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/60",
    Converted: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/60",
  };
  return styles[status];
};

// --- MAIN COMPONENT ---
export default function TourManagementPage() {
  // Fix Hydration: Track mount state
  const [isMounted, setIsMounted] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterView, setFilterView] = useState<"upcoming" | "completed" | "no_show" | "all">("upcoming");
  
  // Sheet State
  const [selectedTour, setSelectedTour] = useState<TourRecord | null>(null);
  const [sheetNotes, setSheetNotes] = useState("");
  const [sheetStatus, setSheetStatus] = useState<TourStatus>("Pending_Time");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync sheet local state when opened
  useEffect(() => {
    if (selectedTour) {
      setSheetNotes(selectedTour.notes);
      setSheetStatus(selectedTour.status);
    }
  }, [selectedTour]);

  // Filter Logic
  const filteredData = useMemo(() => {
    return MOCK_TOURS.filter((tour) => {
      // 1. Apply View Filter
      let matchesView = true;
      if (filterView === "upcoming") matchesView = ["Pending_Time", "Confirmed"].includes(tour.status);
      if (filterView === "completed") matchesView = ["Completed", "Converted"].includes(tour.status);
      if (filterView === "no_show") matchesView = tour.status === "No_Show";

      // 2. Apply Search Filter
      const matchesSearch = 
        tour.phoneNumber.includes(searchQuery) || 
        tour.listing.property.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.listing.title.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesView && matchesSearch;
    });
  }, [searchQuery, filterView]);

  // Prevent hydration mismatch by returning null or a skeleton until mounted
  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* PAGE HEADER */}
        

        {/* UNIFIED SEARCH & FILTER CHROME */}
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
            <Select value={filterView} onValueChange={(val: any) => setFilterView(val)}>
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

            {/* Location Dropdown */}
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[140px] h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                <SelectItem value="east_legon">East Legon</SelectItem>
                <SelectItem value="cantonments">Cantonments</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-4 w-px bg-zinc-200 hidden md:block mx-1" />

            {/* Results Counter */}
            <div className="hidden md:flex items-center gap-2 pl-1 pr-2">
              <span className="text-[18px] font-semibold tracking-tighter text-zinc-900 leading-none font-tabular-nums">
                {filteredData.length}
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

        {/* EDGE-TO-EDGE DATA TABLE */}
        <div className="bg-white border border-zinc-200/60 rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
          <Table>
            <TableHeader className="bg-zinc-50/30">
              <TableRow className="border-zinc-200/60 hover:bg-transparent">
                <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[200px]">Date & Time</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">Lead Contact</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">Property</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">Status</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10 text-right w-[140px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((tour) => (
                <TableRow 
                  key={tour.id} 
                  className="group border-zinc-100 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTour(tour)}
                >
                  {/* Col 1: Date & Time */}
                  <TableCell className="py-3 align-middle">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-zinc-900 tracking-tight">{formatRelativeDate(tour.scheduledDate)}</span>
                      <span className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1">
                        <HugeiconsIcon icon={Clock01Icon} size={10} />
                        {tour.confirmedTime ? tour.confirmedTime : "Time unconfirmed"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Col 2: Lead Contact */}
                  <TableCell className="py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-mono font-medium text-zinc-800 tracking-tight">{tour.phoneNumber}</span>
                      <a href={`https://wa.me/${tour.phoneNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-[#25D366] hover:bg-[#25D366]/10 rounded-full shrink-0">
                          <HugeiconsIcon icon={WhatsappIcon} size={14} />
                        </Button>
                      </a>
                    </div>
                  </TableCell>

                  {/* Col 3: Property */}
                  <TableCell className="py-3 align-middle">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-zinc-900 leading-tight">{tour.listing.property.propertyName}</span>
                      <span className="text-[11px] text-zinc-500 mt-0.5 truncate max-w-[200px]">{tour.listing.title}</span>
                    </div>
                  </TableCell>

                  {/* Col 4: Status */}
                  <TableCell className="py-3 align-middle">
                    <Badge variant="outline" className={`px-2 py-0 border-0 rounded text-[10px] uppercase tracking-wider font-bold h-5 ${getStatusBadge(tour.status)}`}>
                      {tour.status.replace("_", " ")}
                    </Badge>
                  </TableCell>

                  {/* Col 5: Action */}
                  <TableCell className="py-3 align-middle text-right">
                    <Button variant="outline" size="sm" className="h-8 text-[11px] font-semibold border-zinc-200 text-zinc-700 rounded-lg">
                      Manage Lead
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {/* Empty State */}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-zinc-500 text-sm">
                    No tours match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* LEAD CRM PANEL (Sheet) */}
      <Sheet open={!!selectedTour} onOpenChange={(open) => !open && setSelectedTour(null)}>
        <SheetContent className="w-full sm:max-w-[440px] p-0 bg-[#FAFAFA] border-l border-zinc-200/60 flex flex-col font-sans shadow-2xl">
          {selectedTour && (
            <>
              {/* Header Section */}
              <div className="px-6 pt-10 pb-6 border-b border-zinc-200/60 bg-white">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-900 font-mono">
                      {selectedTour.phoneNumber}
                    </h2>
                    <p className="text-[12px] text-zinc-500 flex items-center gap-1.5 font-medium">
                      <HugeiconsIcon icon={Calendar01Icon} size={12} />
                      {formatRelativeDate(selectedTour.scheduledDate)} {selectedTour.confirmedTime && `at ${selectedTour.confirmedTime}`}
                    </p>
                  </div>
                  <a href={`https://wa.me/${selectedTour.phoneNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">
                    <Button size="icon" className="h-10 w-10 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors shrink-0 ">
                      <HugeiconsIcon icon={WhatsappIcon} size={20} strokeWidth={2} />
                    </Button>
                  </a>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Section 1: Property Context Card */}
                <section>
                  <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Viewing Target</h3>
                  <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)] group relative">
                    {/* Escape Hatch Link */}
                    <Link href={`/admin/properties/${selectedTour.listing.id}`} className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <HugeiconsIcon icon={LinkSquare01Icon} size={14} />
                    </Link>

                    {/* Image Header */}
                    <div className="h-32 w-full bg-zinc-100 relative">
                      <img 
                        src={selectedTour.listing.image} 
                        alt={selectedTour.listing.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 text-white">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">{selectedTour.listing.property.propertyName}</p>
                        <p className="text-[15px] font-semibold leading-tight">{selectedTour.listing.title}</p>
                      </div>
                    </div>
                    
                    {/* Meta Specs */}
                    <div className="p-3 bg-zinc-50/50 flex items-center justify-between border-t border-zinc-200/60 text-[11px] font-medium text-zinc-600">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><HugeiconsIcon icon={BedSingle01Icon} size={12} /> {selectedTour.listing.features.bedrooms} Bed</span>
                        <span className="flex items-center gap-1"><HugeiconsIcon icon={Bathtub01Icon} size={12} /> {selectedTour.listing.features.bathrooms} Bath</span>
                        <span className="flex items-center gap-1"><HugeiconsIcon icon={Maximize01Icon} size={12} /> {selectedTour.listing.features.sizeSqm} sqm</span>
                      </div>
                      <span className="text-[13px] font-bold text-zinc-900 font-tabular-nums">{formatCurrency(selectedTour.listing.price)}/mo</span>
                    </div>
                  </div>
                </section>

                {/* Section 2: Status CRM Toggle */}
                <section>
                  <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Tour Status</h3>
                  <div className="bg-zinc-100/80 border border-zinc-200/60 p-1 rounded-xl flex flex-wrap gap-1">
                    {(['Pending_Time', 'Confirmed', 'Completed', 'No_Show', 'Converted'] as TourStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => setSheetStatus(status)}
                        className={`flex-1 min-w-[30%] py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                          sheetStatus === status 
                            ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/80' 
                            : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-700'
                        }`}
                      >
                        {status.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Section 3: Admin Notes */}
                <section>
                  <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Admin Notes</h3>
                  <Textarea 
                    placeholder="Log feedback, negotiation details, or specific client requests..." 
                    value={sheetNotes}
                    onChange={(e) => setSheetNotes(e.target.value)}
                    className="text-[13px] min-h-[120px] resize-none focus-visible:ring-zinc-500/20 focus-visible:border-zinc-500 bg-white shadow-sm"
                  />
                  <div className="flex justify-end mt-2">
                    <Button size="sm" variant="ghost" className="h-7 text-[11px] text-zinc-500 hover:text-zinc-900">
                      Save Notes
                    </Button>
                  </div>
                </section>

              </div>

              {/* Pinned Conversion Footer */}
              <div className="p-4 bg-white border-t border-zinc-200/80 shadow-[0_-8px_20px_rgba(0,0,0,0.03)] z-20">
                <Button 
                  className="w-full h-11 bg-zinc-900 text-white hover:bg-zinc-800 text-[13px] font-semibold shadow-sm transition-all"
                >
                  <HugeiconsIcon icon={Copy01Icon} size={16} className="mr-2" />
                  Copy Checkout Link
                </Button>
                <p className="text-center text-[10px] text-zinc-400 mt-3 font-medium">
                  Send this secure link via WhatsApp to collect the deposit.
                </p>
              </div>

            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}