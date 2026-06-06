"use client";

import { ComputerProgramming01Icon, Flag01Icon, Home01Icon, MapsLocation01Icon, SmartAcIcon, Sun01Icon, UserGroupIcon, Wallet02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";


export const milestones = [
  {
    year: "2024",
    title: "The Inception",
    desc: "We saw the struggles of the average Ghanaian—hidden fees, unreliable agents, and endless paperwork. WunkatHomes was born with a single mission: to democratize and simplify housing access.",
    icon: Home01Icon,
  },
  {
    year: "2025",
    title: "The Digital Shift",
    desc: "We moved entirely away from traditional brokerage models. By acquiring our own assets, building seamless payment flows, and digitizing the lease, we removed the middleman to drastically lower costs for our tenants.",
    icon: ComputerProgramming01Icon,
  },
  {
    year: "2026",
    title: "Smart Living Standard",
    desc: "We integrated IoT and smart-lock systems into a unified property management platform. We proved that modern security and high-quality living shouldn't be a privilege for the few, but a basic standard for everyone.",
    icon: SmartAcIcon,
  },
  {
    year: "2027",
    title: "Beyond the Capital",
    desc: "We expanded our footprint beyond the bustling center, bringing transparent, high-quality housing to the Northern regions and beyond. We believe your location should never dictate your standard of living.",
    icon: MapsLocation01Icon,
  },
  {
    year: "2028",
    title: "The Green Promise",
    desc: "Recognizing the reality of the local power grid, we introduced standard solar backups across our properties. No more noisy generators or sudden blackouts—just uninterrupted, peaceful comfort for every family.",
    icon: Sun01Icon,
  },
  {
    year: "2029",
    title: "Rent-to-Own Revolution",
    desc: "We realized that true housing democratization eventually means ownership. We launched accessible pathways for our long-term tenants to convert rent into equity, fostering real generational wealth.",
    icon: Wallet02Icon,
  },
  {
    year: "2030",
    title: "Integrated Communities",
    desc: "We evolved from individual units to holistic community developments. Our spaces transformed to include built-in remote workspaces and reliable fiber internet, tailored for the modern Ghanaian professional.",
    icon: UserGroupIcon,
  },
  {
    year: "2031",
    title: "A Nationwide Standard",
    desc: "What started as a modest mission to eliminate hidden fees evolved into a movement. WunkatHomes is no longer just an alternative; it is the definitive benchmark for how an entire nation lives.",
    icon: Flag01Icon,
  },
];

export default function History() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 50%"],
  });

  // Smooth out the scroll progress line so it doesn't stutter
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section ref={containerRef} className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-24 text-center"
        >
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="h-[2px] w-8 bg-[#1a1a1a]" />
            <span className="uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold text-slate-400">
              Our Journey
            </span>
            <div className="h-[2px] w-8 bg-[#1a1a1a]" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-[#1a1a1a] uppercase tracking-tight leading-tight">
            Building for <br/>
            <span 
              className="text-transparent" 
              style={{ WebkitTextStroke: "2px #1a1a1a" }}
            >
              every Ghanaian.
            </span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Subtle background line */}
          <div className="absolute left-[27px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-[2px] bg-slate-100" />
          
          {/* Animated progress line */}
          <motion.div 
            className="absolute left-[27px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-[2px] bg-[#1a1a1a] origin-top z-0"
            style={{ scaleY }}
          />

          {/* Milestones */}
          <div className="space-y-20 md:space-y-32">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div 
                  key={milestone.year}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                  className={`relative flex flex-col md:flex-row items-start md:items-center ${
                    isEven ? "md:text-right" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Center Node / Icon */}
                  <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center z-10">
                    <motion.div 
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                      className="w-14 h-14 rounded-full bg-black border-[3px] border-white shadow-sm flex items-center justify-center"
                    >
                      <HugeiconsIcon icon={Icon} size={24} className="text-white" variant="stroke" />
                    </motion.div>
                  </div>
                  
                  {/* Content Container */}
                  <div className={`pl-20 md:pl-0 w-full md:w-[45%] ${isEven ? "md:pr-16" : "md:pl-16"}`}>
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-black uppercase tracking-widest text-[#1a1a1a] bg-slate-50 rounded-full">
                      {milestone.year}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight mb-4">
                      {milestone.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed font-medium text-sm md:text-base">
                      {milestone.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}