"use client";

import { useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import PropertyCard, { IProperty } from "@/components/property-card";
type similarProps = {
  similar: IProperty[];
  propertyType: string;
};
export default function SimilarCarousel({
  similar,
  propertyType,
}: similarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      // Scrolls exactly one card width (or half the screen) at a time
      const scrollAmount =
        direction === "left" ? -clientWidth / 1.5 : clientWidth / 1.5;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (similar.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-16 border-t border-black/10">
      {/* Header & Arrow Controls */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
          Similar{" "}
          {similar[0]?.property.propertyType.split("_")[0] || propertyType}{" "}
          Listings
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-black hover:bg-primary hover:text-white transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-black hover:bg-primary hover:text-white transition-colors"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
          </button>
        </div>
      </div>

      {/* Scrollable Track (Tailwind trick to hide scrollbars natively) */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 md:gap-8 snap-x snap-mandatory pb-8 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {similar.map((property, index) => (
          <div
            key={property.id}
            className="min-w-[300px] md:min-w-[300px] flex-shrink-0 snap-start"
          >
            <PropertyCard property={property} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
}
