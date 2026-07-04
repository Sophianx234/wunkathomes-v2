"use client";

import {
  ShieldCheck,
  Banknote,
  Search,
  MapPin,
  Scale,
  Droplets
} from "lucide-react";

interface ThingsToKnowProps {
  isRent: boolean;
  propertyType: "Apartment_Building" | "Commercial" | "House" | "Land" | string;
}

export default function ThingsToKnow({
  isRent,
  propertyType,
}: ThingsToKnowProps) {
  const isLand = propertyType?.toLowerCase() === "land";

  const considerations = [
    {
      title: "Title & Legal Documents",
      icon: ShieldCheck,
      description: isLand 
        ? "Verify the Land Commission indenture and ensure the site plan matches the coordinates perfectly to avoid disputes."
        : "All property deeds and ownership certificates have been pre-verified by our legal compliance team.",
    },
    {
      title: "Hidden Costs & Taxes",
      icon: Banknote,
      description: isRent
        ? "Be aware of potential extra costs like sanitation fees, security levies, or upfront utility deposits before signing."
        : "Factor in the 5% stamp duty and potential property valuation fees required during the transfer of ownership.",
    },
    {
      title: "Property Inspections",
      icon: Search,
      description: isLand
        ? "We recommend a physical site visit to confirm boundary pillars and check the topography for waterlogging."
        : "Check for consistent water supply (Polytank availability), dampness on walls, and structural integrity during your tour.",
    },
    {
      title: "Zoning & Area Regulations",
      icon: MapPin,
      description: "Ensure the local municipal assembly zoning allows for your intended residential or commercial use.",
    },
    {
      title: isRent ? "Terms of Agreement" : "Sale Agreement",
      icon: Scale,
      description: isRent
        ? "Review the tenancy agreement carefully, noting the subletting clauses, maintenance responsibilities, and renewal terms."
        : "Our legal team provides a standardized, equitable Sale and Purchase Agreement to protect both buyer and seller.",
    },
    {
      title: "Utility & Water Consistency",
      icon: Droplets,
      description: "Water supply can be intermittent in certain neighborhoods. We verify backup storage (Polytank) capacities for you.",
    },
  ];

  // If the property is Land, remove the Utility & Water Consistency since it might not apply directly
  const displayItems = isLand ? considerations.slice(0, 5) : considerations;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 border-t border-slate-200">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-8">
        Things to know before you {isRent ? "Rent" : "Buy"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {displayItems.map((item, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 shrink-0">
              <item.icon size={24} className="text-slate-700" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
