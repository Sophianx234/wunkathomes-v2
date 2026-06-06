"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, PlayCircle02Icon } from "@hugeicons/core-free-icons";

export default function Hero() {
  return (
    // REMOVED min-h-[650px]. Added a much safer min-h-[500px] just for extreme mobile landscape.
    // Changed to flex-col and justify-end to ensure content behaves perfectly within the viewport boundaries.
    <section className="relative w-full h-[calc(100vh-5rem)] min-h-[500px] bg-black overflow-hidden flex flex-col justify-end pb-28 md:pb-36">
      {/* === Cinematic Background (Slow continuous zoom) === */}
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: 1.1 }}
        transition={{
          duration: 25,
          ease: "linear",
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="/c-2.jpg"
          alt="Exclusive Multimillion Dollar Property"
          fill
          priority
          className="object-cover object-center brightness-75"
        />
      </motion.div>

       {/* FIXED: Dark radial/linear vignette stack handles clean readability on dark mode layouts */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-black/20" />

      {/* === Content Container === */}
      <div className="relative  z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row justify-between items-end gap-8 md:gap-12">
        {/* Left Side: Massive Typography */}
        <div className="max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-6xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-4 md:mb-6"
          >
            Beyond <br />
            {/* The Fireart / High-End Hollow Text Effect */}
            <span
              className="text-transparent"
              style={{ WebkitTextStroke: "2px white" }}
            >
              Compromise.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-base md:text-lg lg:text-[.89rem] text-white/80 font-light max-w-xl mb-8 md:mb-10 leading-relaxed"
          >
            Step into an exclusive portfolio of properties owned and managed
            entirely by WunkatHomes. No agents. No friction. Just flawless
            living.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/properties">
              <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-white text-primary font-bold uppercase rounded-md tracking-widest text-[10px] md:text-xs hover:bg-black hover:text-white border-2 border-white transition-all duration-300 flex items-center justify-center gap-3 group">
                View Portfolio
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                />
              </button>
            </Link>
            <Link href="/about">
              <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-md bg-transparent text-white font-bold uppercase tracking-widest text-[10px] md:text-xs border-2 border-white/30 hover:border-white transition-all duration-300 flex items-center justify-center gap-3">
                <HugeiconsIcon icon={PlayCircle02Icon} className="w-4 h-4" />
                The Experience
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Right Side: Architectural Stats */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="hidden lg:flex flex-col gap-6 border-l-2 border-white/20 pl-8 pb-2"
        >
          <div>
            <p className="text-3xl xl:text-2xl font-black text-white leading-none">
              100%
            </p>
            <p className="text-[10px]  uppercase tracking-widest text-white/60 mt-2 font-bold">
              Verified Ownership
            </p>
          </div>
          <div>
            <p className="text-3xl xl:text-2xl font-black text-white leading-none">
              0
            </p>
            <p className="text-[10px]  uppercase tracking-widest text-white/60 mt-2 font-bold">
              Third-Party Agents
            </p>
          </div>
          <div>
            <p className="text-3xl xl:text-2xl font-black text-white leading-none">
              60s
            </p>
            <p className="text-[10px]  uppercase tracking-widest text-white/60 mt-2 font-bold">
              Digital Lease Signing
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
