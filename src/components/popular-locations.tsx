"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { MapPin } from "@hugeicons/core-free-icons"

const locations = [
  { city: "Accra", image: "/a-2.jpg", listings: 42 },
  { city: "Kumasi", image: "/a-4.jpg", listings: 28 },
  { city: "Takoradi", image: "/a-3.jpg", listings: 16 },
]

export default function PopularLocations() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-white to-gray-100">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-extrabold text-zinc-900 mb-4"
        >
          Explore Popular Locations
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-zinc-500 mb-14 max-w-2xl mx-auto leading-relaxed"
        >
         Explore the cities our community loves most, and find a stay that feels just right for your</motion.p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {locations.map((loc, index) => (
            <motion.div
              key={loc.city}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative group overflow-hidden rounded-lg bg-zinc-900"
            >
              {/* Image with elegant gradient overlay */}
              <div className="relative w-full h-80">
                <Image
                  src={loc.image}
                  alt={loc.city}
                  fill
                  className="object-cover brightness-95 group-hover:brightness-100 group-hover:scale-105 transition-all duration-700"
                />
                {/* Stylish gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-all duration-500 group-hover:from-black/40 group-hover:via-transparent group-hover:to-transparent" />
              </div>

              {/* Floating text */}
              <div className="absolute inset-0 flex flex-col justify-end text-left p-6 text-white z-10">
                <motion.h3
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="text-2xl font-semibold drop-shadow-sm"
                >
                  {loc.city}
                </motion.h3>
                <p className="mt-2 flex items-center gap-2 text-sm text-zinc-200">
                  <HugeiconsIcon icon={MapPin} className="text-white/90" />
                  <span>{loc.listings} listings</span>
                </p>
              </div>

              {/* Subtle border glow on hover */}
              <div className="absolute inset-0 rounded-lg ring-1 ring-gray-900/10 group-hover:ring-gray-900/20 transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
