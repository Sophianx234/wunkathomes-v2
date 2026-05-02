"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default function Manifesto() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Parallax scroll effect for the background image
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })
  
  const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacityFade = useTransform(scrollYProgress, [0, 1], [0.4, 0])

  // High-end easing curve (Apple-style smooth ease-out)
  const transitionSettings = { duration: 1.2, ease: [0.16, 1, 0.3, 1] }

  return (
    <section 
      ref={containerRef}
      // Changed to min-h-screen to ensure it can expand if needed on tiny devices
      className="relative min-h-[90vh] md:min-h-screen w-full bg-[#050505] flex flex-col overflow-hidden"
    >
      {/* === Atmospheric Background === */}
      
      <motion.div 
        style={{ y: yParallax, opacity: opacityFade }}
        className="absolute inset-0 z-0 w-full h-full pointer-events-none"
      >
        <Image
          src="/c-1.jpg"
          alt="WunkatHomes Architecture"
          fill
          className="object-cover  brightness-100"
          priority
        />
        {/* Radial vignette to focus the eye strictly on the text */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_80%)]" />
      </motion.div>

      {/* 
        UX FIX: Flex-1 Spacer 
        Pushes the main content to the optical center of the screen
      */}
      <div className="flex-1" />

      {/* === The Manifesto Content === */}
      {/* Added py-12 so the text never touches the top or bottom edges */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center py-12">
        
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transitionSettings, delay: 0.2 }}
          className="flex items-center justify-center gap-4 mb-6 md:mb-10"
        >
          <div className="h-[1px] w-8 md:w-12 bg-white/30" />
          <span className="uppercase tracking-[0.4em] text-[10px] md:text-xs font-semibold text-white/50">
            Our Manifesto
          </span>
          <div className="h-[1px] w-8 md:w-12 bg-white/30" />
        </motion.div>

        {/* The Declaration (Massive Typography) */}
        <div className="flex flex-col items-center mb-6 md:mb-10">
          
          {/* Line 1 */}
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ ...transitionSettings, delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-medium text-white tracking-tight leading-none py-2 whitespace-nowrap"
            >
              The middleman
            </motion.h1>
          </div>
          
          {/* Line 2 */}
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ ...transitionSettings, delay: 0.5 }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-none py-2 whitespace-nowrap text-transparent"
              style={{ WebkitTextStroke: '2px rgba(255,255,255,0.9)' }}
            >
              is obsolete.
            </motion.h1>
          </div>
        </div>

        {/* The Thesis Statement */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transitionSettings, delay: 0.7 }}
          className="text-sm sm:text-base md:text-xl text-white/60 font-light leading-relaxed max-w-3xl mx-auto px-4"
        >
          For decades, acquiring a home meant navigating a maze of brokers, hidden fees, and archaic paperwork. We engineered that system out of existence. We own 100% of our portfolio. No agents. No fake listings. Just direct access to flawless living spaces.
        </motion.p>

      </div>

      {/* 
        UX FIX: Scroll Indicator Container
        Uses flex-1 to push itself to the bottom of the screen, BUT it remains 
        in the document flow. It will NEVER overlap the text above it.
      */}
      <div className="flex-1 flex flex-col justify-end items-center relative z-10 pb-8 md:pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="hidden sm:flex flex-col items-center gap-4 text-white/30"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold">The Standard</span>
          <motion.div 
            animate={{ y: [0, 8, 0] }} 
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <HugeiconsIcon icon={ArrowDown01Icon} size={20} />
          </motion.div>
        </motion.div>
      </div>

    </section>
  )
}