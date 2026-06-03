"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  QuoteDownIcon,
  QuoteUpIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

// --- Editorial Testimonial Data ---
const testimonials = [
  {
    id: 1,
    quote:
      "I landed at Kotoka at 11 PM. By 11:45 PM, I was in my East Legon penthouse using a PIN generated on my phone. WunkatHomes hasn't just improved real estate; they’ve completely digitized it.",
    author: "Marcus T.",
    role: "FinTech Founder",
    location: "East Legon Suite",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    quote:
      "Privacy is my absolute highest priority. The fact that I could lease a secure diplomatic residence without dealing with a chain of third-party agents or physical keys is unprecedented.",
    author: "Elena R.",
    role: "Foreign Attaché",
    location: "Cantonments City",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    quote:
      "I paid my yearly lease balance via a bank transfer from London. The Admin ledger cleared it in hours, and my Tuya smart-lock activated instantly. This is how global living should be.",
    author: "Jonathan K.",
    role: "Global Director",
    location: "Airport Residential",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop",
  },
];

// Framer Motion variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
    filter: "blur(4px)",
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 20 : -20,
    opacity: 0,
    filter: "blur(4px)",
  }),
};

export default function TheVoices() {
  const [[page, direction], setPage] = useState([0, 0]);

  const currentIndex =
    ((page % testimonials.length) + testimonials.length) % testimonials.length;
  const currentTestimonial = testimonials[currentIndex];

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  return (
    <section className="bg-white text-black py-16 md:py-24 flex flex-col relative overflow-hidden border-t border-black/10">
      <div className="w-full flex-1 flex flex-col max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* === Top Anchored Header & Controls (UX Fix) === */}
        {/* By placing controls here, they never move when text length changes */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="h-[2px] w-8 bg-primary" />
            <span className="uppercase tracking-[0.3em] text-[10px] font-bold text-slate-400">
              The Voices
            </span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-6">
            {/* Progress Indicator */}
            <div className="hidden sm:flex gap-2 mr-2">
              {testimonials.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 transition-all duration-500 rounded-full ${index === currentIndex ? "w-8 bg-primary" : "w-3 bg-slate-200"}`}
                />
              ))}
            </div>

            {/* Forward/Back Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => paginate(-1)}
                className="w-10 h-10 flex items-center justify-center border-2 border-black bg-white hover:bg-primary hover:text-white transition-colors duration-300"
                aria-label="Previous Testimonial"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
              </button>
              <button
                onClick={() => paginate(1)}
                className="w-10 h-10 flex items-center justify-center border-2 border-black bg-white hover:bg-primary hover:text-white transition-colors duration-300"
                aria-label="Next Testimonial"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* === The Quote Content === */}
        {/* Added a minimum height so the section below doesn't bounce as text changes */}
        <div className="relative min-h-[300px] md:min-h-[250px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
                filter: { duration: 0.3 },
              }}
              className="w-full"
            >
              {/* Quote with Inline Icons */}
              <h2 className="text-2xl sm:text-3xl md:text-3xl  tracking-tight leading-relaxed md:leading-[1.4] mb-10 max-w-4xl mx-auto text-black font-medium">
                <span className="inline-block  mr-3 -mt-3 align-top">
                  <HugeiconsIcon icon={QuoteUpIcon} size={36} />
                </span>
                {currentTestimonial.quote}
                <span className="inline-block  ml-3 -mb-3 align-bottom">
                  <HugeiconsIcon icon={QuoteDownIcon} size={36} />
                </span>
              </h2>

              {/* Author Details & Image */}
              <div className="flex items-center gap-4 md:gap-5">
                <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                  <Image
                    src={currentTestimonial.image}
                    alt={currentTestimonial.author}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="hidden md:block w-6 h-[2px] bg-slate-200" />

                <div>
                  <div className="text-base md:text-lg font-black uppercase tracking-tight text-black">
                    {currentTestimonial.author}
                  </div>
                  <div className="text-xs md:text-sm font-medium text-slate-500 mt-0.5">
                    {currentTestimonial.role}{" "}
                    <span className="text-slate-300 mx-1.5">|</span>{" "}
                    {currentTestimonial.location}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
