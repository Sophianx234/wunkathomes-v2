"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring } from "framer-motion";

// --- Helper Component: Animated Counter ---
function AnimatedNumber({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState("0");

  const spring = useSpring(0, { mass: 1, stiffness: 50, damping: 20 });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      setDisplayValue(Math.floor(latest).toString());
    });
  }, [spring]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}
      {suffix}
    </span>
  );
}

// --- Main Component ---
const metrics = [
  {
    target: 0,
    suffix: "",
    title: "Hidden Fees",
    description:
      "We believe in total honesty. No surprise costs, no sneaky agent commissions, just the price you see.",
  },
  {
    target: 100,
    suffix: "%",
    title: "Verified Homes",
    description:
      "We personally manage every property we list, so you can move in with total peace of mind.",
  },
  {
    target: 60,
    suffix: "s", // seconds
    title: "Move-in Ready",
    description:
      "From payment to digital key access in under a minute. Your new space is ready whenever you are.",
  },
];

export default function ByTheNumbers() {
  return (
    <section className="bg-white py-24 relative overflow-hidden">
      {/* Subtle Background Texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #1a1a1a 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* === Metrics Grid === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.2,
                ease: "easeOut",
              }}
              className="flex flex-col items-center text-center pt-12 md:pt-0 px-4"
            >
              {/* Massive Number */}
              <div
                className="text-7xl lg:text-8xl font-black mb-6 tracking-tighter text-transparent"
                style={{ WebkitTextStroke: "2px #1a1a1a" }}
              >
                <AnimatedNumber value={metric.target} suffix={metric.suffix} />
              </div>

              {/* Text Content */}
              <h3 className="text-xl md:text-xl font-black uppercase tracking-tight mb-3 text-[#1a1a1a]">
                {metric.title}
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed max-w-xs mx-auto text-sm md:text-base">
                {metric.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}