"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-black">
      {/* === Background Image === */}
      <div className="absolute inset-0">
        <Image
          src="/c-2.jpg"
          alt="Luxury Real Estate Background"
          fill
          priority
          className="object-cover object-center scale-105 brightness-[0.75] saturate-[1.1]"
        />
      </div>

      {/* === Deep Artistic Overlay === */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.08)_0%,transparent_60%)] mix-blend-soft-light" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(240,220,180,0.06)_0%,rgba(90,150,255,0.04)_100%)] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_70%,rgba(0,0,0,0.7)_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
          style={{
            backgroundImage:
              "url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')",
          }}
        />
      </div>

      {/* === Content === */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-28 md:py-44 flex flex-col md:flex-row items-center gap-16 text-white">
        {/* Left Side */}
        <div className="flex-1 text-center md:text-left space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <p className="uppercase tracking-[0.25em] text-sm md:text-base text-gray-300 font-medium">
              Exclusive Properties • Refined Living
            </p>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.15] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
              Discover Timeless <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                Luxury Homes
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-xl mx-auto md:mx-0 font-light"
          >
            Discover subscription-based living made simple. WunkatHomes offers elegant, fully managed rooms designed for comfort, style, and peace of mind.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 pt-4 justify-center items-center md:justify-start md:items-start"
          >
            <Link href="/browse">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-white text-black rounded-full font-semibold text-base md:text-lg flex items-center justify-center gap-2 shadow-lg"
              >
                Explore Homes
                <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link href="/about">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 border-2 border-white text-white rounded-full font-semibold text-base md:text-lg hover:bg-white hover:text-black transition-all duration-300"
              >
                Learn More
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Right Side Showcase */}
        <motion.div
          className="flex-1 relative w-full h-[420px] md:h-[520px] hidden md:block"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/20">
            <Image
              src="/c-1.jpg"
              alt="Luxury Interior Showcase"
              fill
              className="object-cover transition-transform duration-700 "
            />
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)] blur-2xl pointer-events-none" />
        </motion.div>
      </div>
    </section>
  )
}
