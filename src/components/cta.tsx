"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function Cta() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/c-3.jpg"
          alt="Luxury modern home"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60 md:bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-40 text-center text-white">
        {/* Tagline */}
        <motion.div
          className="inline-block mb-5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <span className="text-sm uppercase tracking-widest font-medium text-gray-100">
            Discover Extraordinary Living
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          className="text-4xl md:text-6xl font-semibold leading-tight md:leading-[1.1] max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          Find your dream home with{" "}
          <span className="text-white/90 font-light">WunkatHomes</span>
        </motion.h2>

        {/* Description */}
        <motion.p
          className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          From exclusive penthouses to tranquil escapes. explore verified
          listings designed for modern lifestyles. Trust, transparency, and
          timeless design in every stay.
        </motion.p>

        {/* Button */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <Link
            href="login"
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-full bg-white text-primary font-medium text-lg tracking-wide transition-all duration-300 hover:bg-gray-100 hover:shadow-xl hover:scale-[1.03]"
          >
            Get Started
            <HugeiconsIcon
              icon={ArrowRight}
              className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>

        {/* Accent line */}
        <motion.div
          className="mt-16 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2 mx-auto"
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
        />
      </div>

      {/* Decorative soft lights */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
    </section>
  );
}
