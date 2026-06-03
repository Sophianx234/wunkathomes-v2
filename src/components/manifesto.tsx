"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function Manifesto() {
  return (
    <section className="relative h-[80vh] md:h-[90vh] w-full flex items-end pb-12 md:pb-24 bg-[#050505] overflow-hidden">
      {/* === Atmospheric Background (Scale-in Parallax) === */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full h-full relative"
        >
          <Image
            // The sleek concrete architectural shot
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"
            alt="WunkatHomes Architecture"
            fill
            className="object-cover opacity-60 "
            priority
          />
          {/* Gradient overlay mimicking the Explore page to guarantee text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
        </motion.div>
      </div>

      {/* === Hero Content (Explore Page Architecture) === */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12">
        {/* Left Side: Massive Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full"
        >
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="h-[2px] w-8 bg-white" />
            <span className="uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold text-white">
              Our Manifesto
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-5xl lg:text-8xl font-black text-white leading-[0.85] tracking-tighter uppercase">
            The Middleman <br />
            <span
              className="text-transparent"
              style={{ WebkitTextStroke: "2px white" }}
            >
              is obsolete.
            </span>
          </h1>
        </motion.div>

        {/* Right Side: Thesis & Call to Action */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-md w-full shrink-0"
        >
          <p className="text-white/80 font-medium text-base md:text-sm leading-relaxed mb-8">
            For decades, acquiring a home meant navigating a maze of brokers,
            hidden fees, and archaic paperwork. We engineered that system out of
            existence. We own 100% of our portfolio. No agents. No fake
            listings. Just direct access to flawless living spaces.
          </p>

          {/* 
            Instead of routing to a new page, this button smoothly scrolls the user 
            down into the "Wunkat Standard" section that directly follows this hero.
          */}
          <button
            onClick={() =>
              window.scrollTo({
                top: window.innerHeight * 0.85,
                behavior: "smooth",
              })
            }
            className="w-full sm:w-auto px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white border-2 border-transparent hover:border-white transition-all duration-300 flex items-center justify-center sm:justify-start gap-3 group"
          >
            Read The Standard
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={18}
              className="group-hover:translate-y-1 transition-transform"
            />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
