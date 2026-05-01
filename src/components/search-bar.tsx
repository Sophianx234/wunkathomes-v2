"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Alert01Icon, 
  House01Icon, 
  Location01Icon, 
  Search01Icon,
  Tag01Icon,
  Key01Icon,
  Building01Icon,
  Store01Icon,
  Home01Icon,
  House02Icon,
  MapingIcon,
  House03Icon,
  TagsIcon
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import RoomCard, { IRoom } from "./room-card"

export default function SearchBar() {
  const [filters, setFilters] = useState({
    location: "",
    status: "",
    propertyType: "",
  })
  const [results, setResults] = useState<IRoom[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelectChange = (name: string, value: string) => {
    // Treat "all" as an empty string to clear the filter in the API
    const val = value === "all" ? "" : value
    setFilters(prev => ({ ...prev, [name]: val }))
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault() 
    
    setLoading(true)
    setError(null)
    setResults([])
    setSearched(true)

    try {
      const params = new URLSearchParams()
      if (filters.location) params.append("location", filters.location)
      if (filters.status) params.append("status", filters.status)
      if (filters.propertyType) params.append("propertyType", filters.propertyType)

      const res = await fetch(`/api/rooms/search?${params.toString()}`)
      const data = await res.json()

      if (res.ok) {
        setResults(data.data || [])
      } else {
        setError(data.message || "Something went wrong")
      }
    } catch (err) {
      setError("Failed to fetch search results.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative z-10 -mt-16 px-4 sm:px-6 ">
      {/* 🔍 Search Bar - Transformed into Dropdowns */}
      <motion.form
        onSubmit={handleSearch}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl md:rounded-full p-2 flex flex-col md:flex-row md:items-center border border-slate-100 md:divide-x md:divide-slate-200"
      >
        
        {/* 1. Property Type Dropdown */}
        <div className="flex items-center gap-3 flex-1 px-4 py-3 hover:bg-slate-50 rounded-full md:rounded-r-none md:rounded-l-full transition-colors group cursor-pointer border-t md:border-t-0 border-slate-100">
          <HugeiconsIcon icon={House03Icon} size={24} className="text-slate-400 group-hover:text-primary transition-colors shrink-0" />
          <div className="flex flex-col w-full">
            <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-0.5">Property Type</label>
            <Select onValueChange={(val) => handleSelectChange('propertyType', val)}>
              <SelectTrigger className="w-full border-0 p-0 h-auto bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 text-slate-600 font-medium text-base outline-none">
                <SelectValue placeholder="What type?" />
              </SelectTrigger>
              <SelectContent className="bg-white p-0 w-full min-w-[var(--radix-select-trigger-width)]">
                <div className="divide-y divide-slate-100 flex flex-col w-full">
                  
                  {/* Note the `w-full [&>span]:w-full` trick which forces the shadcn item to stretch fully */}
                  <SelectItem value="all" className="cursor-pointer w-full [&>span]:w-full font-medium py-3 rounded-none focus:bg-slate-50">
                    <div className="flex w-full flex-1 text-slate-700 justify-between items-center pr-2">
                      <span>All Types</span>
                      <HugeiconsIcon icon={House01Icon} size={16} className="text-slate-400 shrink-0"/> 
                    </div>
                  </SelectItem>
                  <SelectItem value="Apartment" className="cursor-pointer w-full [&>span]:w-full font-medium py-3 rounded-none focus:bg-slate-50">
                    <div className="flex w-full text-slate-700 flex-1 justify-between items-center pr-2">
                      <span>Apartment</span>
                      <HugeiconsIcon icon={Building01Icon} size={16} className="text-slate-400 shrink-0"/>
                    </div>
                  </SelectItem>
                  <SelectItem value="Commercial" className="cursor-pointer w-full [&>span]:w-full font-medium py-3 rounded-none focus:bg-slate-50">
                    <div className="flex w-full text-slate-700 flex-1 justify-between items-center pr-2">
                      <span>Commercial Property</span>
                      <HugeiconsIcon icon={Store01Icon} size={16} className="text-slate-400 shrink-0"/>
                    </div>
                  </SelectItem>
                  <SelectItem value="House" className="cursor-pointer w-full [&>span]:w-full font-medium py-3 rounded-none focus:bg-slate-50">
                    <div className="flex text-slate-700 w-full flex-1 justify-between items-center pr-2">
                      <span>House</span>
                      <HugeiconsIcon icon={Home01Icon} size={16} className="text-slate-400 shrink-0"/>
                    </div>
                  </SelectItem>
                  <SelectItem value="Land" className="cursor-pointer w-full [&>span]:w-full font-medium py-3 rounded-none focus:bg-slate-50">
                    <div className="flex w-full flex-1 justify-between items-center pr-2">
                      <span>Land</span>
                      <HugeiconsIcon icon={MapingIcon} size={16} className="text-slate-400 shrink-0"/>
                    </div>
                  </SelectItem>
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 2. Location Dropdown */}
        <div className="flex items-center gap-3 flex-1 px-4 py-3 hover:bg-slate-50 rounded-none transition-colors group cursor-pointer border-t md:border-t-0 border-slate-100">
          <HugeiconsIcon icon={MapingIcon} size={24} className="text-slate-400 group-hover:text-primary transition-colors shrink-0" />
          <div className="flex flex-col w-full">
            <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-0.5">Location</label>
            <Select onValueChange={(val) => handleSelectChange('location', val)}>
              <SelectTrigger className="w-full border-0 p-0 h-auto bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 text-slate-600 font-medium text-base outline-none">
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent className="bg-white p-0 w-full min-w-[var(--radix-select-trigger-width)]">
                {/* Divide-Y successfully applied here */}
                <div className="divide-y divide-slate-100 flex flex-col w-full">
                  <SelectGroup className="w-full divide-y divide-slate-100 flex flex-col">
                    <SelectItem value="all" className="cursor-pointer w-full [&>span]:w-full font-medium py-3 rounded-none focus:bg-slate-50">
                      <div className="flex w-full flex-1 justify-between items-center pr-2">
                        <span>All Locations</span>
                        <HugeiconsIcon icon={Location01Icon} size={16} className="text-slate-400 shrink-0"/>
                      </div>
                    </SelectItem>
                    
                    <div className="bg-slate-50 py-1.5 px-2">
                      <SelectLabel className="text-xs uppercase tracking-widest text-slate-500 font-bold m-0 p-0 pl-2">Greater Accra</SelectLabel>
                    </div>

                    <SelectItem value="East Legon" className="cursor-pointer w-full [&>span]:w-full font-medium py-3 rounded-none focus:bg-slate-50">
                      <div className="flex w-full flex-1 justify-between items-center pr-2">
                        <span>East Legon</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Cantonments" className="cursor-pointer w-full [&>span]:w-full font-medium py-3 rounded-none focus:bg-slate-50">
                      <div className="flex w-full flex-1 justify-between items-center pr-2">
                        <span>Cantonments</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Osu" className="cursor-pointer w-full [&>span]:w-full font-medium py-3 rounded-none focus:bg-slate-50">
                      <div className="flex w-full flex-1 justify-between items-center pr-2">
                        <span>Osu</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Airport Residential" className="cursor-pointer w-full [&>span]:w-full font-medium py-3 rounded-none focus:bg-slate-50">
                      <div className="flex w-full flex-1 justify-between items-center pr-2">
                        <span>Airport Residential</span>
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 3. Status Dropdown (Rent/Sale) */}
        <div className="flex items-center gap-3 flex-1 px-4 py-3 hover:bg-slate-50 rounded-full md:rounded-l-none transition-colors group cursor-pointer border-t md:border-t-0 border-slate-100">
          <HugeiconsIcon icon={TagsIcon}  size={24} className="text-slate-400 group-hover:text-primary transition-colors shrink-0" />
          <div className="flex flex-col w-full">
            <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-0.5">Status</label>
            <Select onValueChange={(val) => handleSelectChange('status', val)}>
              <SelectTrigger className="w-full border-0 p-0 h-auto bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 text-slate-600 font-medium text-base outline-none">
                <SelectValue placeholder="Rent or Sale?" />
              </SelectTrigger>
              <SelectContent className="bg-white p-0 w-full min-w-[var(--radix-select-trigger-width)]">
                {/* Divide-Y successfully applied here */}
                <div className="divide-y divide-slate-100 flex flex-col w-full">
                  <SelectItem value="all" className="cursor-pointer w-full [&>span]:w-full font-medium py-3 rounded-none focus:bg-slate-50">
                    <div className="flex w-full flex-1 justify-between items-center pr-2">
                      <span>Any Status</span>
                      <HugeiconsIcon icon={Tag01Icon} size={16} className="text-slate-400 shrink-0"/>
                    </div>
                  </SelectItem>
                  <SelectItem value="For_Rent" className="cursor-pointer w-full [&>span]:w-full font-medium py-3 rounded-none focus:bg-slate-50">
                    <div className="flex w-full flex-1 justify-between items-center pr-2">
                      <span>For Rent</span>
                      <HugeiconsIcon icon={Key01Icon} size={16} className="text-primary shrink-0"/>
                    </div>
                  </SelectItem>
                  <SelectItem value="For_Sale" className="cursor-pointer w-full [&>span]:w-full font-medium py-3 rounded-none focus:bg-slate-50">
                    <div className="flex w-full flex-1 justify-between items-center pr-2">
                      <span>For Sale</span>
                      <HugeiconsIcon icon={Tag01Icon} size={16} className="text-primary shrink-0"/>
                    </div>
                  </SelectItem>
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Button */}
        <div className="p-2 w-full md:w-auto mt-2 md:mt-0">
          <Button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 rounded-full disabled:opacity-70 flex items-center justify-center gap-2 font-bold text-base shadow-md transition-transform hover:scale-[1.02] active:scale-95"
          >
            {loading ? (
              <span className="animate-pulse">Searching...</span>
            ) : (
              <>
                <HugeiconsIcon icon={Search01Icon} size={20} /> 
                <span className="md:hidden lg:inline">Search</span>
              </>
            )}
          </Button>
        </div>
      </motion.form>

      {/* 🏠 Search Results Area */}
      <div className={`max-w-7xl mx-auto mt-16 min-h-[200px] hidden ${loading && 'block'}`}>
        
        {/* Error State */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-red-500 bg-red-50 p-6 rounded-2xl max-w-md mx-auto">
            <HugeiconsIcon icon={Alert01Icon} size={32} className="mb-2" />
            <p className="font-medium text-center">{error}</p>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && searched && results.length === 0 && !error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-slate-400 py-12">
            <HugeiconsIcon icon={House01Icon} size={48} className="mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-600">No properties found</p>
            <p className="text-sm mt-1">Try adjusting your filters or searching a different area.</p>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex flex-col gap-4">
                <div className="bg-slate-200 rounded-2xl aspect-square w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Results Grid */}
        <AnimatePresence>
          {!loading && results.length > 0 && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
              {results.map((room) => (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <RoomCard room={room} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}