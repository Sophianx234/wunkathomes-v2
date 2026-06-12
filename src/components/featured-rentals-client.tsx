"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import PropertyCard from "./property-card";

interface FeaturedRentalsClientProps {
  properties: any[];
}

export default function FeaturedRentalsClient({ properties }: FeaturedRentalsClientProps) {
  const [visibleCount, setVisibleCount] = useState(4);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  const displayedProperties = properties.slice(0, visibleCount);
  const hasMore = visibleCount < properties.length;

  if (properties.length === 0) return null;

  return (
    <section className="bg-slate-50 py-20 md:py-28 overflow-hidden border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* === Section Header === */}
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-8 mb-12 md:mb-16">
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
              Find your <br />
              <span
                className="text-transparent"
                style={{ WebkitTextStroke: "1.5px black" }}
              >
                perfect rental.
              </span>
            </h2>
          </motion.div>

          {/* User-Friendly Editorial Copy */}
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-sm md:text-base text-slate-500 font-medium max-w-sm "
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
                Show More Rentals
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