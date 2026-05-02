"use client";

import Image from "next/image";
import { Search,  Key, FileEditIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Explore & Secure",
    icon: Search,
    description:
      "Discover our exclusive company-owned homes. Pay your booking deposit instantly online via Paystack to secure your space.",
    imageSrc: "/mock-1.png", 
    imageAlt: "WunkatHomes application showing property listing and deposit button",
  },
  {
    number: "02",
    title: "Sign & Settle",
    icon: FileEditIcon,
    description:
      "Review and digitally sign your legally binding tenancy agreement on your phone. Complete your remaining rent balance via bank transfer.",
    imageSrc: "/mock-1.png",
    imageAlt: "WunkatHomes application showing digital lease agreement and signature",
  },
  {
    number: "03",
    title: "Receive Access",
    icon: Key,
    description:
      "Once verified, receive your unique Smart Lock PIN immediately. Move in on your start date, managed entirely by WunkatHomes.",
    imageSrc: "/mock-1.png",
    imageAlt: "WunkatHomes active lease dashboard generating a Smart Lock PIN",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-24 px-6 bg-white text-primary overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20 md:mb-32">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-neutral-800 text-lg md:text-xl max-w-2xl mx-auto"
          >
            Three seamless steps to secure, sign, and unlock your new WunkatHome.
          </motion.p>
        </div>

        {/* Steps Container */}
        <div className="flex flex-col gap-24 md:gap-32">
          {steps.map((step, index) => {
            const isEven = index % 2 !== 0;

            return (
              <div
                key={step.number}
                className={`flex flex-col md:flex-row items-center gap-12 lg:gap-24 ${
                  isEven ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Mockup Image Side */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? 40 : -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="w-full md:w-1/2 flex justify-center relative"
                >
                  {/* Aspect ratio container for the isometric render */}
                  <div className="relative w-full max-w-[500px] aspect-[4/3]">
                    <Image
                      src={step.imageSrc}
                      alt={step.imageAlt}
                      fill
                      className="object-contain drop-shadow-2xl"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={index === 0}
                    />
                  </div>
                </motion.div>

                {/* Text Content Side */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                  className="w-full md:w-1/2 flex flex-col justify-center"
                >
                  <div className="flex items-start gap-6">
                    {/* Massive Step Number */}
                    <span className="text-7xl md:text-8xl font-black leading-none tracking-tighter text-primary select-none">
                      {step.number}
                    </span>

                    <div className="pt-2">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-3xl md:text-4xl font-bold tracking-tight">
                          {step.title}
                        </h3>
                        <HugeiconsIcon icon={step.icon} className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-neutral-600 text-lg leading-relaxed max-w-md">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}