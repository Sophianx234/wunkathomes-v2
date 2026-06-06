"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import {
  UserAdd02Icon,
  Calendar02Icon,
  Wallet02Icon,
  SignatureIcon,
  SmartAcIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const steps = [
  {
    number: "01",
    title: "Join the Community",
    desc: "Start by creating your account. A quick sign-up gives you full, unrestricted access to browse our exclusive, company-managed properties.",
    icon: UserAdd02Icon,
  },
  {
    number: "02",
    title: "Schedule a Viewing",
    desc: "Found a place that feels like home? Request a site visit directly through the platform. We want you to experience the space before making any commitments.",
    icon: Calendar02Icon,
  },
  {
    number: "03",
    title: "Secure Your Space",
    desc: "Once you are certain, lock it in. Pay your initial deposit seamlessly online to reserve the property and immediately take it off the market.",
    icon: Wallet02Icon,
  },
  {
    number: "04",
    title: "Sign & Settle",
    desc: "Say goodbye to stacks of paperwork. Review and digitally sign your legally binding tenancy agreement right from your smartphone.",
    icon: SignatureIcon,
  },
  {
    number: "05",
    title: "Unlock & Move In",
    desc: "Voila! Receive your unique smart-lock PIN immediately. Move in on your exact start date, with zero hassle and total peace of mind.",
    icon: SmartAcIcon,
  },
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 60%"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section ref={containerRef} className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-24 text-center"
        >
          <span className="uppercase tracking-[0.2em] text-xs font-bold text-slate-400 mb-4 block">
            The Process
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-[#1a1a1a] tracking-tight">
            How It Works?
          </h2>
        </motion.div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Static Background Line */}
          <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-[2px] bg-slate-100" />

          {/* Animated Progress Line */}
          <motion.div
            className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-[2px] bg-[#1a1a1a] origin-top z-0"
            style={{ scaleY }}
          />

          {/* Steps */}
          <div className="space-y-16 md:space-y-32">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={step.number}
                  className={`relative flex flex-col md:flex-row items-start md:items-center w-full ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Central Node */}
                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center z-10 mt-6 md:mt-0">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                      className="w-10 h-10 rounded-full bg-white border-[3px] border-[#1a1a1a] shadow-sm flex items-center justify-center"
                    >
                      <span className="text-[10px] font-black text-[#1a1a1a]">
                        {step.number}
                      </span>
                    </motion.div>
                  </div>

                  {/* Left Side Content (Text for Even, Icon for Odd) */}
                  <div className={`w-full md:w-1/2 pl-24 md:pl-0 ${isEven ? "md:pr-20 md:text-right" : "md:pl-20"}`}>
                    {isEven ? (
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      >
                        <h3 className="text-2xl font-bold text-[#1a1a1a] mb-3">
                          {step.title}
                        </h3>
                        <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                          {step.desc}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="hidden md:flex justify-end"
                      >
                        <div className="w-32 h-32 rounded-3xl bg-black flex items-center justify-center border border-[#1a1a1a]/5">
                          <HugeiconsIcon icon={Icon} size={48} className="text-white" variant="stroke" />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Right Side Content (Icon for Even, Text for Odd) */}
                  <div className={`w-full md:w-1/2 pl-24 md:pl-0 mt-6 md:mt-0 ${isEven ? "md:pl-20" : "md:pr-20 md:text-left"}`}>
                    {isEven ? (
                      <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex justify-start"
                      >
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-black flex items-center justify-center border border-[#1a1a1a]/5">
                          <HugeiconsIcon icon={Icon} size={48} className="text-white" variant="stroke" />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      >
                        <h3 className="text-2xl font-bold text-[#1a1a1a] mb-3">
                          {step.title}
                        </h3>
                        <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                          {step.desc}
                        </p>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Mobile Icon (Only visible on small screens for Odd items) */}
                  {!isEven && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="md:hidden w-full pl-24 mt-6"
                    >
                       <div className="w-24 h-24 rounded-3xl bg-black flex items-center justify-center border border-[#1a1a1a]/5">
                          <HugeiconsIcon icon={Icon} size={40} className="text-[#1a1a1a]" variant="stroke" />
                        </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}