"use client"

import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Cancel01Icon, Menu01Icon, Search01Icon, UserCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()

  const toggleMenu = () => setMenuOpen(!menuOpen)

  // Shrink the central search pill when the user scrolls down
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true)
    } else {
      setIsScrolled(false)
    }
  })

  return (
    <header 
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-white border-b border-border shadow-sm' : 'bg-background'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* h-20 gives a bit more breathing room for the premium feel */}
        <div className="flex justify-between items-center h-20 relative">
          
          {/* 1. Logo (Left) */}
          <Link href="/" className="flex  items-center gap-2 font-bold text-lg z-50 group shrink-0">
          <div className="relative  size-10">

            <Image
            fill  
            alt="WunkatHomes logo" 
            src="/images/home.png" 
            className="object-contain size-10  transition-transform" 
            />
            </div>
            <span className="pt-2 text-primary hidden sm:block tracking-tight">
              Wunkat<span className="">Homes</span>
            </span>
          </Link>

          {/* 2. Airbnb-style Interactive Search Pill (Center - Absolute to stay perfectly centered) */}
          <motion.div 
            className="hidden md:flex items-center bg-white border border-slate-200 shadow-sm rounded-full p-2 cursor-pointer  transition-shadow absolute left-1/2 -translate-x-1/2 z-40"
            animate={{
              width: isScrolled ? '280px' : '440px',
              gap: isScrolled ? '0.5rem' : '1rem',
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {!isScrolled ? (
              <div className="flex w-full divide-x divide-slate-200 text-sm font-medium text-slate-700">
                <button className="px-4 py-1.5 hover:bg-slate-50 rounded-l-full transition-colors flex-1 text-left whitespace-nowrap">
                  Any Location
                </button>
                <button className="px-4 py-1.5 hover:bg-slate-50 transition-colors flex-1 text-left whitespace-nowrap">
                  Any Price
                </button>
                <button className="px-4 py-1.5 hover:bg-slate-50 text-slate-500 font-normal flex-1 text-left whitespace-nowrap">
                  Add Dates
                </button>
              </div>
            ) : (
              <div className="flex-1 px-4 text-sm font-medium text-slate-700">
                Search properties...
              </div>
            )}
            
            <div className=" bg-primary p-2 rounded-full text-white ml-auto flex-shrink-0">
              <HugeiconsIcon icon={Search01Icon} size={16}  strokeWidth={2.5} />
            </div>
          </motion.div>

          {/* 3. Desktop Navigation & Actions (Right) */}
          <div className="hidden md:flex items-center gap-4 z-50 shrink-0">
            <nav className="flex items-center gap-6 mr-2 font-medium text-sm">
              <Link href="/rooms" className="text-slate-600 hover:text-indigo-600 transition">
                Browse Rooms
              </Link>
              <Link href="/about" className="text-slate-600 hover:text-indigo-600 transition">
                About
              </Link>
            </nav>

            <Button variant="outline" asChild className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50">
              <Link href="/login">Login</Link>
            </Button>
            
            {/* Airbnb Style Profile Menu Trigger */}
            <button className="flex items-center gap-2 border border-slate-200 rounded-full p-1.5 pl-3  transition-all bg-white">
              {/* ✅ FIX: Wrapped Menu01Icon in HugeiconsIcon */}
              <HugeiconsIcon icon={Menu01Icon} size={18} className="text-slate-600" />
              <div className="bg-slate-100 p-1 rounded-full text-slate-600">
                <HugeiconsIcon icon={UserCircleIcon} size={24}  />
              </div>
            </button>
          </div>

          {/* 4. Mobile Controls (Visible only on small screens) */}
          <div className="flex items-center gap-3 md:hidden z-50">
            {/* Quick mobile search trigger */}
            <Button variant="ghost" size="icon" className="rounded-full text-slate-600">
              <HugeiconsIcon icon={Search01Icon} size={22}  />
            </Button>
            
            <motion.button
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              className="text-slate-800 focus:outline-none p-2 bg-slate-100 rounded-full"
            >
              {menuOpen ? (
                <HugeiconsIcon icon={Cancel01Icon} size={20}  />
              ) : (
                <HugeiconsIcon icon={Menu01Icon} size={20}  />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* 5. Mobile Menu Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white border-t border-slate-100 shadow-xl overflow-hidden absolute w-full"
          >
            <nav className="flex flex-col px-6 py-8 gap-6">
              <Link href="/" onClick={toggleMenu} className="text-lg font-medium text-slate-800 hover:text-indigo-600 transition">
                Home
              </Link>
              <Link href="/browse" onClick={toggleMenu} className="text-lg font-medium text-slate-800 hover:text-indigo-600 transition">
                Browse Rooms
              </Link>
              <Link href="/about" onClick={toggleMenu} className="text-lg font-medium text-slate-800 hover:text-indigo-600 transition">
                About
              </Link>
              <Link href="/contact" onClick={toggleMenu} className="text-lg font-medium text-slate-800 hover:text-indigo-600 transition">
                Contact
              </Link>
              
              <div className="h-px bg-slate-100 my-2"></div>
              
              <Button asChild className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg">
                <Link href="/login" onClick={toggleMenu}>Log in / Sign up</Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}