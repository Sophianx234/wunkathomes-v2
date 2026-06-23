"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function Manifesto() {
  return (
    <section className="relative h-[80vh] md:h-[90vh] w-full flex items-end pb-12 md:pb-24 bg-[#050505] overflow-hidden">
      {/* === Atmospheric Background === */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full h-full relative"
        >
          <Image
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"
            alt="WunkatHomes Architecture"
            fill
            className="object-cover opacity-40"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>
      </div>

      {/* === Hero Content === */}
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
            <span className="uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold text-zinc-400">
              Our Vision
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl  font-black text-white leading-[0.85] tracking-tighter uppercase">
            Your home <br />
            <span
              className="text-transparent"
              style={{ WebkitTextStroke: "2px white" }}
            >
              made simple.
            </span>
          </h1>
        </motion.div>

        {/* Right Side: Thesis & CTA */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-md w-full shrink-0"
        >
          <p className="text-zinc-300 font-medium text-base md:text-sm leading-relaxed mb-8">
            Finding a home shouldn't be a maze of hidden fees and complicated 
            paperwork. We’ve removed the obstacles to give you direct access to 
            beautiful, verified living spaces. No middlemen, no stress—just the 
            keys to your next chapter.
          </p>

          <button
            onClick={() =>
              window.scrollTo({
                top: window.innerHeight * 0.85,
                behavior: "smooth",
              })
            }
            className="w-full sm:w-auto px-8 py-4 rounded-md bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-zinc-900 hover:text-white border-2 border-transparent hover:border-white transition-all duration-300 flex items-center justify-center sm:justify-start gap-3 group  shadow-xl"
          >
            How it works
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
