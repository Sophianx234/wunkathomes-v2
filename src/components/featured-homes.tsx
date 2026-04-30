"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { FavouriteIcon, Key01Icon, StarIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import RoomSkeleton from "./skeletons/room-skeleton"



// Assuming this is inside your parent component's render method

interface Room {
  _id: string
  name: string
  description: string
  rating: number
  reviews: number
  price: number
  beds: number
  baths: number
  planType: string
  images: string[]
  houseId: {
    name: string
    location: {
      address: string
      city: string
      region: string
      country: string
    }
  }
}

export default function FeaturedHomes() {
  const [homes, setHomes] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch("/api/rooms")
        if (!res.ok) throw new Error("Failed to fetch rooms")

        const data = await res.json()

        // Add random ratings and reviews for realism
        const enriched = data.map((room: Room) => ({
          ...room,
          rating: (4.7 + Math.random() * 0.3).toFixed(2),
          reviews: Math.floor(Math.random() * 200) + 50,
        }))

        setHomes(enriched.slice(0, 6))
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])



  return (
    <section id="homes" className="py-16 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Featured Homes</h2>
          <p className="text-gray-600 text-lg">Discover handpicked properties available now.</p>
        </div>

{loading && (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, index) => (
      <RoomSkeleton key={index} index={index} />
    ))}
  </div>
)}

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
  {!loading && homes.map((home, index) => (
    <motion.div
      key={home._id}
      className="group cursor-pointer flex flex-col gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      {/* 1. Image Container - App-first Aspect Ratio (taller than standard 16:9) */}
      <div className="relative aspect-[20/19] overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={home.images[0] || "/placeholder.svg"}
          alt={home.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Top Gradient for icon visibility */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />

        {/* Floating Favorite Button */}
        <button className="absolute top-3 right-3 p-2 text-white hover:scale-110 active:scale-95 transition-all z-10 drop-shadow-md">
          <HugeiconsIcon icon={FavouriteIcon} size={26}  />
        </button>

        {/* PropTech Badge: Smart Lock Ready */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <HugeiconsIcon icon={Key01Icon} size={12} className="text-primary"  />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800">Smart Lock</span>
        </div>

        {/* Simulated Image Carousel Dots (Airbnb style) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-white opacity-100 shadow-sm"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white opacity-60 shadow-sm"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white opacity-60 shadow-sm"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white opacity-60 shadow-sm"></div>
        </div>
      </div>

      {/* 2. Text Content - Clean, borderless typography */}
      <div className="flex flex-col">
        {/* Row 1: Location & Rating */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-slate-900 text-[15px] truncate">
            {home.houseId.location.city}, {home.houseId.location.address}
          </h3>
          <div className="flex items-center gap-1 shrink-0 mt-0.5">
            {/* Using solid variant for the star so it matches Airbnb's filled star */}
            <HugeiconsIcon icon={StarIcon} size={14}  className="text-slate-900" />
            <span className="text-sm font-medium text-slate-900">{home.rating}</span>
          </div>
        </div>

        {/* Row 2: Property Name/Desc */}
        <p className="text-slate-500 text-[15px] truncate mt-0.5">
          {home.name}
        </p>

        {/* Row 3: Specs */}
        <p className="text-slate-500 text-[15px] mt-0.5">
          {home.beds} Beds • {home.baths} Baths
        </p>

        {/* Row 4: Pricing */}
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-semibold text-slate-900 text-[15px]">${home.price}</span>
          <span className="text-slate-900 text-[15px]">/month</span>
        </div>
      </div>
    </motion.div>
  ))}
</div>
      </div>
    </section>
  )
}
