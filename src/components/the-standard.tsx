"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Building04Icon,
  File02Icon,
  Key01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

// --- Warm, Human-Centric Pillars ---
const pillars = [
  {
    number: "01",
    title: "Exclusively Managed.",
    description:
      "Every home on our platform is exclusively managed by our team. That means no surprise landlords, no fake listings, and absolutely no hidden broker fees.",
    icon: Building04Icon,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop", 
  },
  {
    number: "02",
    title: "Paperless Rentals.",
    description:
      "Say goodbye to endless paperwork. Review clear terms, verify your identity, and sign your lease securely from your phone in a matter of minutes.",
    icon: File02Icon,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop", 
  },
  {
    number: "03",
    title: "Smart Security.",
    description:
      "Your safety and convenience come first. As soon as your booking is confirmed, a secure, unique smart-lock code is sent directly to your device for instant access.",
    icon: Key01Icon,
    image: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?q=80&w=2070&auto=format&fit=crop", 
  },
];

export default function TheStandard() {
  return (
    <section className="bg-white border-y-2 border-black overflow-hidden">
      <div className="mx-auto flex flex-col">
        {/* === Section Header === */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col md:flex-row justify-between items-end gap-8"
          >
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[2px] w-8 bg-black" />
                <span className="uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold text-zinc-500">
                  The Wunkat Promise
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black text-black leading-[0.9] tracking-tighter uppercase">
                Zero <br />
                <span
                  className="text-transparent"
                  style={{ WebkitTextStroke: "2px black" }}
                >
                  Compromises.
                </span>
              </h2>
            </div>

            <p className="text-sm md:text-base text-zinc-600 font-medium leading-relaxed max-w-sm md:text-right">
              We handle everything from the ground up so you can enjoy a seamless, 
              worry-free living experience without relying on third parties.
            </p>
          </motion.div>
        </div>

        {/* === Editorial Z-Grid === */}
        <div className="flex flex-col border overflow-hidden border-black">
          {pillars.map((pillar, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={pillar.number}
                className={`grid grid-cols-1 lg:grid-cols-2 ${isEven ? "" : "lg:bg-zinc-50/50"}`}
              >
                {/* --- Text Block --- */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className={`group relative p-8 sm:p-10 lg:p-16 xl:p-20 flex flex-col justify-between transition-colors duration-500 hover:bg-black
                    ${isEven ? "order-1" : "order-1 lg:order-2"}
                  `}
                >
                  <div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-black uppercase tracking-tight mb-4 group-hover:text-white transition-colors duration-500 leading-none">
                      {pillar.title}
                    </h3>
                    <p className="text-sm md:text-base text-zinc-600 font-medium leading-relaxed group-hover:text-zinc-400 transition-colors duration-500 max-w-lg">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="flex items-end justify-between mt-12 md:mt-16">
                    <HugeiconsIcon 
                      icon={pillar.icon} 
                      size={32} 
                      className="text-zinc-300 group-hover:text-white transition-colors duration-500" 
                    />
                    <span className="text-xl lg:text-2xl font-black tracking-widest text-zinc-300 group-hover:text-white/20 transition-colors duration-500 leading-none">
                      {pillar.number}
                    </span>
                  </div>
                </motion.div>

                {/* --- Image Block --- */}
                <div
                  className={`relative h-[300px] sm:h-[350px] lg:h-[450px] xl:h-[500px] overflow-hidden group 
                  ${isEven ? "order-2" : "order-2 lg:order-1"}
                `}
                >
                  <motion.div
                    initial={{ scale: 1.1 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <Image
                      src={pillar.image}
                      alt={pillar.title}
                      fill
                      className="object-cover bg-left transition-transform duration-1000 ease-out group-hover:scale-105"
                      unoptimized // Prevents timeout errors with Unsplash links
                    />
                    <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] pointer-events-none" />
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
