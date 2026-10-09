"use client";

import { motion } from "framer-motion";

export default function History() {
  return (
    <section className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="h-[2px] w-8 bg-[#1a1a1a]" />
            <span className="uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold text-zinc-400">
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

        {/* Narrative */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-base md:text-lg text-zinc-600 leading-[1.8] md:leading-[2] font-medium space-y-8"
        >
          <p>
            Finding a place to live in Ghana is exhausting. House hunting quickly becomes a stressful cycle of dealing with unofficial agents, paying nonrefundable viewing fees for places that do not match their photos, and negotiating with landlords who demand two years of rent advance. For a young professional or a growing family, securing shelter drains life savings and creates unnecessary anxiety before a lease is even signed.
          </p>
          <p>
            Wunkat Homes was built to dismantle this system. We experienced the frustration firsthand and decided it was time to build an alternative that respected the time and finances of ordinary Ghanaians. We wanted to create a housing experience where securing a beautiful apartment did not require emptying your bank account or dealing with middlemen.
          </p>
          <p>
            By acquiring and managing our own properties, we eliminated the hidden fees and the staggering upfront demands. We replaced the traditional and chaotic brokerage process with a transparent digital platform. Today, finding a home means browsing verified listings, paying a fair deposit online, and signing your tenancy agreement from your phone.
          </p>
          <p>
            We are proving that modern security, high quality living, and flexible payments are not privileges reserved for a wealthy few. They are standards everyone deserves. Our mission is to make comfortable living accessible, straightforward, and fair for every Ghanaian.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
