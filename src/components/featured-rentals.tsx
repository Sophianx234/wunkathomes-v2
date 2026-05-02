"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import PropertyCard, { IProperty } from "./property-card";

// Dummy data specific to rentals (with monthly pricing and apartment/suite focus)
const propertiesForRent: IProperty[] = [
  {
    id: "r1",
    title: "The Ridge Executive Suite",
    location: "Ridge, Accra",
    price: "$3,500 / mo",
    type: "Apartment",
    beds: 2,
    baths: 2.5,
    sqft: "1,800",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1de2d9d0cb?q=80&w=2073&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ff6?q=80&w=2070&auto=format&fit=crop",
    ],
  },
  {
    id: "r2",
    title: "Labone Garden Loft",
    location: "Labone, Accra",
    price: "$2,200 / mo",
    type: "Apartment",
    beds: 1,
    baths: 1,
    sqft: "1,100",
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502005097973-6a708b7cd211?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2074&auto=format&fit=crop",
    ],
  },
  {
    id: "r3",
    title: "Cantonments City Townhouse",
    location: "Cantonments, Accra",
    price: "$4,500 / mo",
    type: "Townhouse",
    beds: 3,
    baths: 3.5,
    sqft: "2,600",
    images: [
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd80d6c0?q=80&w=2070&auto=format&fit=crop",
    ],
  },
  {
    id: "r4",
    title: "Dzorwulu Minimalist Flat",
    location: "Dzorwulu, Accra",
    price: "$1,800 / mo",
    type: "Apartment",
    beds: 2,
    baths: 2,
    sqft: "1,450",
    images: [
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070&auto=format&fit=crop",
    ],
  },
  {
    id: "r5",
    title: "Airport City Penthouse",
    location: "Airport City, Accra",
    price: "$6,000 / mo",
    type: "Apartment",
    beds: 4,
    baths: 4.5,
    sqft: "3,800",
    images: [
      "https://images.unsplash.com/photo-1600607688969-a5bfcd64bd2b?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2067&auto=format&fit=crop",
    ],
  },
  {
    id: "r6",
    title: "East Legon Smart Studio",
    location: "East Legon, Accra",
    price: "$1,200 / mo",
    type: "Studio",
    beds: 1,
    baths: 1,
    sqft: "850",
    images: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?q=80&w=2071&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556020685-e631998f7c7b?q=80&w=2000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070&auto=format&fit=crop",
    ],
  },
];

export default function FeaturedRentals() {
  // State to manage how many cards are visible
  const [visibleCount, setVisibleCount] = useState(4);

  const handleLoadMore = () => {
    // Reveal 4 more properties each time they click
    setVisibleCount((prev) => prev + 4);
  };

  const displayedProperties = propertiesForRent.slice(0, visibleCount);
  const hasMore = visibleCount < propertiesForRent.length;

  return (
    // Subtly alternating the background color to slate-50 breaks up the white space
    <section className="bg-slate-50 py-20 md:py-28 overflow-hidden border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* === Section Header === */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[2px] w-8 bg-black" />
              <span className="uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold text-slate-500">
                Flexible Living
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-primary leading-tight tracking-tight uppercase">
              Curated <br />
              {/* Hollow text effect matches the Sales section */}
              <span
                className="text-transparent"
                style={{ WebkitTextStroke: "1.5px black" }}
              >
                For Rent.
              </span>
            </h2>
          </motion.div>

          {/* Editorial Text */}
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-sm md:text-base text-slate-500 font-medium max-w-sm md:text-right"
          >
            Discover subscription-based living. High-end, fully managed rentals
            with digital lease signing and instant smart-lock access.
          </motion.p>
        </div>

        {/* === Property Grid === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          <AnimatePresence>
            {displayedProperties.map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={index % 4}
              />
            ))}
          </AnimatePresence>
        </div>

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
                className="px-10 py-4 bg-transparent text-primary font-bold uppercase tracking-widest text-xs border-2 border-black hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                Load More Rentals
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={16}
                  className="group-hover:translate-y-1 transition-transform"
                />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
