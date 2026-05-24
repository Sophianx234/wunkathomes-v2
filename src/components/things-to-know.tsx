"use client";

import { 
  File02Icon, 
  Key01Icon, 
  Shield01Icon, 
  ArrowRight01Icon,
  CompassIcon 
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface WunkatProtocolProps {
  isRent: boolean;
  propertyType: 'Apartment_Building' | 'Commercial' | 'House' | 'Land' | string;
}

export default function ThingsToKnow({ isRent, propertyType }: WunkatProtocolProps) {
  const cleanType = propertyType?.toLowerCase() || "";

  // --- 1. Dynamic Content Helper for Column 1: The Booking Process ---
  const getBookingContent = () => {
    if (isRent) {
      return (
        <ul className="space-y-2">
          <li>• A small holding deposit keeps this property reserved just for you for 72 hours.</li>
          <li>• Review and sign your lease agreement entirely online through your user profile.</li>
          <li>• Pay your first month's rent and refundable security deposit before your move-in date.</li>
        </ul>
      );
    } else {
      return (
        <ul className="space-y-2">
          <li>• A small online deposit secures this property and temporarily takes it off the market.</li>
          <li>• Please share a proof of funds or bank pre-approval letter within 48 hours of booking.</li>
          <li>• Our in-house legal team will guide you through a smooth, secure title deed transfer.</li>
        </ul>
      );
    }
  };

  // --- 2. Dynamic Content Helper for Column 2: Access & Keys ---
  const getAccessContent = () => {
    if (cleanType === "land") {
      return {
        title: "Site Visits & Boundaries",
        icon: CompassIcon,
        button: "View Site Map",
        text: (
          <ul className="space-y-2">
            <li>• Schedule a guided tour with us or visit the plot on your own schedule.</li>
            <li>• All physical corner pillars and boundaries are clearly marked out on the ground.</li>
            <li>• Digital site plans and exact plot coordinates are instantly available to download.</li>
          </ul>
        )
      };
    }

    if (cleanType === "commercial") {
      return {
        title: "Smart Business Access",
        icon: Key01Icon,
        button: "Smart Entry Guide",
        text: (
          <ul className="space-y-2">
            <li>• No keys to pass around. Your secure digital entry codes are generated automatically.</li>
            <li>• Easily set up temporary entry PINs for your staff, vendors, or contractors.</li>
            <li>• Manage your business hours access anytime directly from your smartphone.</li>
          </ul>
        )
      };
    }

    // Default Residential (House / Apartment Building)
    return {
      title: "Move-In & Keyless Entry",
      icon: Key01Icon,
      button: "Smart Lock Guide",
      text: (
        <ul className="space-y-2">
          <li>• Enjoy code-based access with your secure digital smart lock. No key exchange required!</li>
          <li>• Your digital entry code activates automatically on your scheduled move-in day.</li>
          <li>• Create temporary digital codes for family, friends, or cleaners from your dashboard.</li>
        </ul>
      )
    };
  };

  // --- 3. Dynamic Content Helper for Column 3: The Property Promise ---
  const getPromiseContent = () => {
    if (cleanType === "land") {
      return (
        <ul className="space-y-2">
          <li>• Guaranteed 100% dispute-free land background checked by our compliance team.</li>
          <li>• All documents are registered and completely ready for immediate development.</li>
          <li>• Clear zoning information is provided upfront so you know exactly what you can build.</li>
        </ul>
      );
    }
    return (
      <ul className="space-y-2">
        <li>• This property is completely managed by WunkatHomes, ensuring high maintenance standards.</li>
        <li>• Deal with us directly. There are no middle-men landlords or surprise brokerage fees.</li>
        <li>• Enjoy peace of mind with active outdoor security and a dedicated support team.</li>
      </ul>
    );
  };

  const accessDetails = getAccessContent();

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 border-t border-slate-200">
      <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-8">
        Things to know before you {isRent ? "Rent" : "Buy"}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        
        {/* Column 1: Booking & Financial Process */}
        <div className="flex flex-col items-start">
          <div className="mb-4 text-slate-900">
            <HugeiconsIcon icon={File02Icon} size={24} />
          </div>
          <h3 className="font-bold text-base mb-3 uppercase tracking-tight text-slate-900">
            Booking Process
          </h3>
          <div className="text-slate-500 text-[13px] md:text-sm leading-relaxed font-medium flex-1 space-y-2">
            {getBookingContent()}
          </div>
          <button className="mt-5 text-[10px] font-bold uppercase tracking-widest border-b-[1.5px] border-black pb-0.5 hover:text-slate-500 hover:border-slate-500 transition-colors flex items-center gap-1.5 group">
            Booking Guide <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Column 2: Access, Moving, and Inspections */}
        <div className="flex flex-col items-start">
          <div className="mb-4 text-slate-900">
            <HugeiconsIcon icon={accessDetails.icon} size={24} />
          </div>
          <h3 className="font-bold text-base mb-3 uppercase tracking-tight text-slate-900">
            {accessDetails.title}
          </h3>
          <div className="text-slate-500 text-[13px] md:text-sm leading-relaxed font-medium flex-1 space-y-2">
            {accessDetails.text}
          </div>
          <button className="mt-5 text-[10px] font-bold uppercase tracking-widest border-b-[1.5px] border-black pb-0.5 hover:text-slate-500 hover:border-slate-500 transition-colors flex items-center gap-1.5 group">
            {accessDetails.button} <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Column 3: Safety & Guarantees */}
        <div className="flex flex-col items-start">
          <div className="mb-4 text-slate-900">
            <HugeiconsIcon icon={Shield01Icon} size={24} />
          </div>
          <h3 className="font-bold text-base mb-3 uppercase tracking-tight text-slate-900">
            Our Guarantee
          </h3>
          <div className="text-slate-500 text-[13px] md:text-sm leading-relaxed font-medium flex-1 space-y-2">
            {getPromiseContent()}
          </div>
          <button className="mt-5 text-[10px] font-bold uppercase tracking-widest border-b-[1.5px] border-black pb-0.5 hover:text-slate-500 hover:border-slate-500 transition-colors flex items-center gap-1.5 group">
            Our Commitments <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  )
}