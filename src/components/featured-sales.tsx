"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import PropertyCard,{ IProperty } from "./property-card"

// Expanded dummy data to demonstrate the "Load More" functionality
const propertiesForSale: IProperty[] = [
  {
    id: "1",
    title: "The Glasshouse Villa",
    location: "East Legon, Accra",
    price: "$1,250,000",
    type: "House",
    beds: 4,
    baths: 4.5,
    sqft: "4,200",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd80d6c0?q=80&w=2070&auto=format&fit=crop"
    ]
  },
  {
    id: "2",
    title: "Cantonments Penthouse",
    location: "Cantonments, Accra",
    price: "$850,000",
    type: "Apartment",
    beds: 3,
    baths: 3,
    sqft: "2,800",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ff6?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1de2d9d0cb?q=80&w=2073&auto=format&fit=crop"
    ]
  },
  {
    id: "3",
    title: "Airport Residential Estate",
    location: "Airport Residential, Accra",
    price: "$2,100,000",
    type: "House",
    beds: 5,
    baths: 6,
    sqft: "6,500",
    images: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2067&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
    ]
  },
  {
    id: "4",
    title: "Osu Modern Townhouse",
    location: "Osu, Accra",
    price: "$950,000",
    type: "House",
    beds: 3,
    baths: 3.5,
    sqft: "3,100",
    images: [
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
    ]
  },
  {
    id: "5",
    title: "Spintex Luxury Duplex",
    location: "Spintex, Accra",
    price: "$600,000",
    type: "House",
    beds: 4,
    baths: 4,
    sqft: "3,800",
    images: [
      "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?q=80&w=2073&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687931-cecebd80d6c0?q=80&w=2070&auto=format&fit=crop"
    ]
  },
  {
    id: "6",
    title: "Labone Executive Suite",
    location: "Labone, Accra",
    price: "$1,450,000",
    type: "Apartment",
    beds: 4,
    baths: 4.5,
    sqft: "4,500",
    images: [
      "https://images.unsplash.com/photo-1600607688969-a5bfcd64bd2b?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ff6?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1de2d9d0cb?q=80&w=2073&auto=format&fit=crop"
    ]
  }
]

export default function FeaturedSales() {
  // State to manage how many cards are visible
  const [visibleCount, setVisibleCount] = useState(4)

  const handleLoadMore = () => {
    // Reveal 4 more properties each time they click
    setVisibleCount((prev) => prev + 4)
  }

  const displayedProperties = propertiesForSale.slice(0, visibleCount)
  const hasMore = visibleCount < propertiesForSale.length

  return (
    <section className="bg-white py-20 md:py-28 overflow-hidden">
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
                Exclusive Portfolio
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-black leading-tight tracking-tight uppercase">
              Curated <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '1.5px black' }}>
                For Sale.
              </span>
            </h2>
          </motion.div>

          {/* Replaced the Button with Editorial Text */}
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-sm md:text-base text-slate-500 font-medium max-w-sm md:text-right"
          >
            Explore a handpicked selection of our most prestigious properties. 100% verified, turnkey, and ready for acquisition.
          </motion.p>
        </div>

        {/* === Property Grid === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          <AnimatePresence>
            {displayedProperties.map((property, index) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                index={index % 4} // Modulo keeps the staggered animation clean when new items load
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
                className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs border-2 border-black hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                Load More Properties
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
  )
}