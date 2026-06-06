"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import PropertyCard from "@/components/property-card";

// Friendly, human-centric copy assets
const exploreMeta = {
  rent: {
    heroTitle: "Flexible",
    heroSubtitle: "Living.",
    heroImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075",
    description: "Beautifully designed spaces built around your life. Enjoy fully managed homes with seamless digital lease signing and instant smart-lock access.",
    collections: [
      { title: "Smart Studios", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070", link: "/properties?assetType=apartment&listingType=For_Rent" },
      { title: "Corporate Suites", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069", link: "/properties?assetType=commercial&listingType=For_Rent" },
      { title: "Suburban Retreats", image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=2070", link: "/properties?assetType=house&listingType=For_Rent" },
    ],
  },
  sale: {
    heroTitle: "Acquire",
    heroSubtitle: "Excellence.",
    heroImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070",
    description: "Take ownership of verified, high-end real estate assets. Experience an entirely transparent, worry-free process from search to keys.",
    collections: [
      { title: "Penthouses", image: "https://images.unsplash.com/photo-1600607688969-a5bfcd64bd2b?q=80&w=2070", link: "/properties?assetType=apartment&listingType=For_Sale" },
      { title: "Commercial Hubs", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069", link: "/properties?assetType=commercial&listingType=For_Sale" },
      { title: "Prime Land Plots", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2032", link: "/properties?assetType=land&listingType=For_Sale" },
    ],
  },
};

interface ExploreClientLayoutProps {
  mode: "rent" | "sale";
  highlights: any[];
}

export default function ExploreClientLayout({ mode, highlights }: ExploreClientLayoutProps) {
  const content = exploreMeta[mode];

  return (
    <div className="bg-white min-h-screen">
      {/* === Mode Toggle Switcher === */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 flex gap-2">
        <Link 
          href="/explore?status=rent"
          scroll={false}
          className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${mode === "rent" ? "bg-white text-black shadow-sm" : "text-white/60 hover:text-white"}`}
        >
          Rentals
        </Link>
        <Link 
          href="/explore?status=sale"
          scroll={false}
          className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${mode === "sale" ? "bg-white text-black shadow-sm" : "text-white/60 hover:text-white"}`}
        >
          Ownership
        </Link>
      </div>

      {/* === 1. Immersive Editorial Hero === */}
      <section className="relative h-[80vh] md:h-[90vh] w-full flex items-end pb-12 md:pb-24 bg-black">
        <div className="absolute inset-0 z-0 bg-black">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full h-full relative"
            >
              <Image
                src={content.heroImage}
                alt={content.heroTitle}
                fill
                className="object-cover opacity-40"
                priority
                unoptimized
              />
              {/* FIXED: Dark radial/linear vignette stack handles clean readability on dark mode layouts */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-black/20" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row justify-between items-end gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[2px] w-8 bg-white" />
              <span className="uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold text-zinc-400">
                Discovery space
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter uppercase">
              {content.heroTitle} <br />
              <span className="text-transparent" style={{ WebkitTextStroke: "2px white" }}>
                {content.heroSubtitle}
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-sm"
          >
            <p className="text-zinc-300 font-medium text-sm leading-relaxed mb-6">
              {content.description}
            </p>
            <Link href={`/properties?listingType=For_${mode === "sale" ? "Sale" : "Rent"}`}>
              <button className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-900 hover:text-white border-2 border-white transition-all duration-300 flex items-center gap-3 group rounded-lg shadow-lg">
                Explore All
                {/* FIXED: Wrapped raw array reference into functional components */}
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* === 2. Curated Collections === */}
      {/* <section className="py-24 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tight mb-16">
          Curated Collections.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 relative rounded-[1.5rem] overflow-hidden group cursor-pointer h-[400px] md:h-[550px]">
            <Link href={content.collections[0].link}>
              <Image 
                src={content.collections[0].image} 
                alt={content.collections[0].title} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500" 
                unoptimized 
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
              <div className="absolute bottom-8 left-8 flex items-center justify-between w-[calc(100%-4rem)]">
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase">{content.collections[0].title}</h3>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-md">
                  <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
                </div>
              </div>
            </Link>
          </div>

          <div className="md:col-span-5 flex flex-col gap-6 h-auto md:h-[550px]">
            {[1, 2].map((idx) => (
              <div key={idx} className="relative flex-1 rounded-[1.5rem] overflow-hidden group cursor-pointer min-h-[200px]">
                <Link href={content.collections[idx].link}>
                  <Image 
                    src={content.collections[idx].image} 
                    alt={content.collections[idx].title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    unoptimized 
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute bottom-6 left-6 flex items-center justify-between w-[calc(100%-3rem)]">
                    <h3 className="text-xl font-black text-white uppercase">{content.collections[idx].title}</h3>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black shadow-md">
                      <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* === 3. Spotlight Assets === */}
      <section className="py-24 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="block h-[2px] w-8 bg-zinc-950" />
                <span className="uppercase tracking-[0.2em] text-[10px] font-bold text-zinc-500">Live Showroom</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-zinc-950 uppercase tracking-tight">
                Featured <br /> Highlights.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((property: any, index: number) => (
              <PropertyCard key={property.id} property={property} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}