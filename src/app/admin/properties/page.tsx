"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  PlusSignIcon, 
  Search01Icon, 
  FilterIcon, 
  ArrowUpRight01Icon, 
  ArrowDownRight01Icon 
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
import PropertyCard, { IProperty } from "@/components/property-card";
import { inventory } from "@/lib/data";
import Link from "next/link";

// --- DUMMY DATA MATCHING YOUR SCHEMA ---
const mockProperties: IProperty[] = [
  {
    id: "1",
    slug: "luxury-2-bed-cantonments",
    title: "Luxury 2-Bedroom Suite",
    description: "Modern apartment with pool access.",
    price: 2500,
    listingType: "For_Rent",
    status: "Available",
    features: { bedrooms: 2, bathrooms: 2, sizeSqm: 120 },
    terms: { leaseTerm: "1 Year Minimum" },
    smartLock: { hasSmartLock: true },
    images: ["/images/prop1.jpg", "/images/prop1-2.jpg"],
    property: { propertyType: "Apartment", location: "Cantonments, Accra" },
  },
  {
    id: "2",
    slug: "commercial-space-east-legon",
    title: "Prime Commercial Retail Space",
    description: "Ground floor retail space.",
    price: 450000,
    listingType: "For_Sale",
    status: "Available",
    features: { bedrooms: 0, bathrooms: 2, sizeSqm: 350 },
    terms: { leaseTerm: null },
    smartLock: { hasSmartLock: false },
    images: ["/images/prop2.jpg"],
    property: { propertyType: "Commercial", location: "East Legon, Accra" },
  },
  {
    id: "3",
    slug: "executive-4-bed-house",
    title: "Executive 4-Bed Detached",
    description: "Family home with large compound.",
    price: 4000,
    listingType: "For_Rent",
    status: "Rented",
    features: { bedrooms: 4, bathrooms: 4.5, sizeSqm: 400 },
    terms: { leaseTerm: "2 Years" },
    smartLock: { hasSmartLock: true },
    images: ["/images/prop3.jpg"],
    property: { propertyType: "House", location: "Airport Residential" },
  }
];

// --- SUB-COMPONENT: EDITORIAL STAT CARD ---


export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen bg-slate-50">
      <div className="max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* --- HEADER --- */}
        

        {/* --- STAT METRICS --- */}
        

        {/* --- DATA CHROME (FILTER BAR) --- */}
        <div className="flex flex-col gap-5 w-full">
  
  {/* --- TOP ROW: Property Type Pills & Action Button --- */}
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    
    {/* Property Type Pills (Horizontal Scroll on Mobile) */}
    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto pb-1 md:pb-0">
      <button className="whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-black text-white shadow-sm transition-all">
        All Assets
      </button>
      <button className="whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all">
        Apartments
      </button>
      <button className="whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all">
        Commercial
      </button>
      <button className="whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all">
        Houses
      </button>
    </div>

    {/* Create Property Button */}
    <Link href="/admin/properties/create" className="text-white  flex items-center bg-black hover:bg-slate-800 rounded-lg h-10 px-5 text-[14px] font-medium shrink-0 w-full md:w-auto">
      <HugeiconsIcon icon={PlusSignIcon} size={18} strokeWidth={2} className="mr-2" />
      Create Property
    </Link>
  </div>

  {/* --- BOTTOM ROW: Unified Search & Filter Chrome --- */}
  <section className="flex flex-col xl:flex-row items-center gap-4 bg-white p-2 border border-slate-200 rounded-xl shadow-sm w-full">
    
    {/* Search Input */}
    <div className="relative flex-1 w-full">
      <HugeiconsIcon 
        icon={Search01Icon} 
        size={18} 
        strokeWidth={2} 
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" 
      />
      <Input 
        placeholder="Search by title, location, or slug..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 h-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[14px] bg-transparent shadow-none"
      />
    </div>

    <div className="h-6 w-px bg-slate-200 hidden xl:block" />

    {/* Dropdowns & Counter Section */}
    <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full xl:w-auto px-2 pb-2 xl:pb-0">
      
      {/* 1. Location Dropdown (Added from reference) */}
      <Select defaultValue="all">
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
      <Select defaultValue="all">
        <SelectTrigger className="w-full md:w-[130px] h-9 border-0 bg-slate-50 hover:bg-slate-100 text-[13px] font-medium text-slate-700 shadow-none focus:ring-0">
          <SelectValue placeholder="Listing Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="rent">For Rent</SelectItem>
          <SelectItem value="sale">For Sale</SelectItem>
        </SelectContent>
      </Select>

      {/* 3. Status Dropdown */}
      <Select defaultValue="available">
        <SelectTrigger className="w-full md:w-[130px] h-9 border-0 bg-slate-50 hover:bg-slate-100 text-[13px] font-medium text-slate-700 shadow-none focus:ring-0">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="rented">Rented / Sold</SelectItem>
        </SelectContent>
      </Select>

      {/* Vertical Separator */}
      <div className="h-6 w-px bg-slate-200 hidden md:block mx-1" />

      {/* 4. Results Counter (Added from reference) */}
      <div className="hidden md:flex items-center gap-2 pl-1 pr-2">
        <span className="text-[22px] font-black text-slate-900 leading-none">
          {mockProperties.length}
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
          Assets<br/>Found
        </span>
      </div>

      {/* Advanced Filter Icon Button */}
      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100 shrink-0 ml-auto md:ml-0">
        <HugeiconsIcon icon={FilterIcon} size={18} strokeWidth={2} />
      </Button>

    </div>
  </section>

</div>

        {/* --- PROPERTY GRID --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {inventory.map((property, index) => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              index={index} 
            />
          ))}
        </section>

      </div>
    </div>
  );
}