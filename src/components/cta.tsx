"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default function Cta() {
  return (
    // Removed min-h-[70vh] to let the component act as a sleek, compact banner
    <section className="flex flex-col lg:flex-row w-full border-y border-black/10 overflow-hidden bg-[#050505]">

      {/* === Left Side: The Narrative (Text) === */}
      {/* Tightened padding (p-8 to xl:p-16) to reduce unnecessary vertical space */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-12 xl:p-16 relative z-10">
        
        {/* Subtle radial glow to give the dark side depth */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.03)_0%,transparent_50%)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="max-w-xl relative z-10"
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-[2px] w-8 bg-white/30" />
            <span className="uppercase tracking-[0.3em] text-[10px] font-bold text-white/50">
              The Final Step
            </span>
          </div>

          {/* Headline - Scaled down slightly to fit smaller viewports seamlessly */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1] text-white mb-5">
            The key is already in <br />
            <span className="italic font-light text-white/50">your pocket.</span>
          </h2>

          {/* Persuasive Body Copy */}
          <p className="text-sm md:text-base text-white/60 font-light leading-relaxed mb-8 md:mb-10">
            Join the hundreds of families who have abandoned the archaic real estate market. No third-party agents. No physical paperwork. Just verified luxury and instant smart-lock access.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4">
            <Link href="/explore?status=rent" className="w-full sm:w-auto">
              <button className="w-full px-6 py-3.5 md:py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-slate-200 transition-colors duration-300 flex items-center justify-center gap-2 md:gap-3 group">
                Explore Rentals
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </Link>

            <Link href="/explore?status=sale" className="w-full sm:w-auto">
              <button className="w-full px-6 py-3.5 md:py-4 bg-transparent text-white font-black uppercase tracking-widest text-[10px] md:text-xs border border-white/30 hover:border-white transition-colors duration-300 flex items-center justify-center gap-3">
                View Portfolio
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* === Right Side: The Visuals (Image) === */}
      {/* Mobile height reduced to 300px. Desktop height naturally stretches to match the left text container. */}
      <div className="w-full lg:w-1/2 relative h-[300px] lg:h-auto overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src="/images/fam-2.jpg"
            alt="Happy Family in a WunkatHomes Apartment"
            fill
            className="object-cover"
          />
        </motion.div>
      </div>

    </section>
  )
}