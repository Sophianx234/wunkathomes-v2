"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight01Icon, Location01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import PropertyCard, { IProperty } from "@/components/property-card"; // Reusing your PropertyCard

// === Dummy Data Tailored for the Explore Page ===
const exploreData = {
  rent: {
    heroTitle: "Flexible",
    heroSubtitle: "Living.",
    heroImage:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075",
    description:
      "Subscription-based luxury. Fully managed, turnkey spaces with instant Tuya smart-lock access.",
    collections: [
      {
        title: "Smart Studios",
        image:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070",
        link: "/properties?type=apartment&status=For_Rent",
      },
      {
        title: "Corporate Suites",
        image:
          "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069",
        link: "/properties?type=apartment&status=For_Rent",
      },
      {
        title: "Suburban Retreats",
        image:
          "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=2070",
        link: "/properties?type=house&status=For_Rent",
      },
    ],
  },
  sale: {
    heroTitle: "Acquire",
    heroSubtitle: "Excellence.",
    heroImage:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070",
    description:
      "100% verified portfolio assets. Seamless digital acquisition and immediate ownership transfer.",
    collections: [
      {
        title: "Penthouses",
        image:
          "https://images.unsplash.com/photo-1600607688969-a5bfcd64bd2b?q=80&w=2070",
        link: "/properties?type=apartment&status=For_Sale",
      },
      {
        title: "Commercial Hubs",
        image:
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069",
        link: "/properties?type=commercial&status=For_Sale",
      },
      {
        title: "Prime Land Plots",
        image:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2032",
        link: "/properties?type=land&status=For_Sale",
      },
    ],
  },
};

// A few highlight properties to show at the bottom
// A few highlight properties to show at the bottom
const highlightProperties: IProperty[] = [
  {
    id: "1",
    slug: "glasshouse-villa",
    title: "The Glasshouse Villa",
    description: "Subscription-based luxury. Fully managed, turnkey spaces.",
    price: 1250000,
    listingType: "For_Sale",
    status: "Available",
    features: {
      bedrooms: 4,
      bathrooms: 4.5,
      sizeSqm: 4200,
    },
    terms: {
      leaseTerm: null,
    },
    smartLock: {
      hasSmartLock: true,
    },
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075",
    ],
    property: {
      propertyType: "House",
      location: "East Legon",
    },
  },
  {
    id: "2",
    slug: "cantonments-penthouse",
    title: "Cantonments Penthouse",
    description:
      "100% verified portfolio assets. Seamless digital acquisition.",
    price: 8500,
    listingType: "For_Rent",
    status: "Available",
    features: {
      bedrooms: 3,
      bathrooms: 3,
      sizeSqm: 2800,
    },
    terms: {
      leaseTerm: "12 Months",
    },
    smartLock: {
      hasSmartLock: true,
    },
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070",
    ],
    property: {
      propertyType: "Apartment",
      location: "Cantonments",
    },
  },
];

// === The Core Interactive View ===
function ExploreView() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status")?.toLowerCase();

  // Default to 'rent' if the parameter is missing or invalid
  const mode = statusParam === "sale" ? "sale" : "rent";
  const content = exploreData[mode];

  return (
    <div className="bg-white min-h-screen">
      {/* === 1. Immersive Editorial Hero === */}
      <section className="relative h-[80vh] md:h-[90vh] w-full flex items-end pb-12 md:pb-24">
        {/* Background Image with Parallax-style positioning */}
        <div className="absolute inset-0 z-0 bg-primary">
          <motion.div
            key={content.heroImage} // Forces re-animation when mode changes
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full h-full relative"
          >
            <Image
              src={content.heroImage}
              alt={content.heroTitle}
              fill
              className="object-cover opacity-60"
              priority
            />
            {/* Gradient overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </motion.div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row justify-between items-end gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[2px] w-8 bg-white" />
              <span className="uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold text-white">
                WunkatHomes Discovery
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.85] tracking-tighter uppercase">
              {content.heroTitle} <br />
              <span
                className="text-transparent"
                style={{ WebkitTextStroke: "2px white" }}
              >
                {content.heroSubtitle}
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-sm"
          >
            <p className="text-white/80 font-medium text-lg leading-relaxed mb-6">
              {content.description}
            </p>
            <Link
              href={`/properties?status=For_${mode.charAt(0).toUpperCase() + mode.slice(1)}`}
            >
              <button className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-white border-2 border-white transition-all duration-300 flex items-center gap-3 group">
                View Inventory
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* === 2. Curated Collections (Asymmetrical Grid) === */}
      <section className="py-24 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tight">
            Curated Collections.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
          {/* Large Left Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-7 relative rounded-2xl md:rounded-[2rem] overflow-hidden group cursor-pointer h-[400px] md:h-full"
          >
            <Link href={content.collections[0].link}>
              <Image
                src={content.collections[0].image}
                alt={content.collections[0].title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-primary/30 group-hover:bg-primary/40 transition-colors" />
              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                <h3 className="text-3xl md:text-4xl font-black text-white uppercase">
                  {content.collections[0].title}
                </h3>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black -rotate-45 group-hover:rotate-0 transition-transform duration-300">
                  <HugeiconsIcon icon={ArrowRight01Icon} size={24} />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Right Stacked Cards */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative flex-1 rounded-2xl md:rounded-[2rem] overflow-hidden group cursor-pointer min-h-[250px]"
            >
              <Link href={content.collections[1].link}>
                <Image
                  src={content.collections[1].image}
                  alt={content.collections[1].title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-primary/30 group-hover:bg-primary/40 transition-colors" />
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <h3 className="text-2xl font-black text-white uppercase max-w-[150px] leading-tight">
                    {content.collections[1].title}
                  </h3>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black -rotate-45 group-hover:rotate-0 transition-transform duration-300">
                    <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex-1 rounded-2xl md:rounded-[2rem] overflow-hidden group cursor-pointer min-h-[250px]"
            >
              <Link href={content.collections[2].link}>
                <Image
                  src={content.collections[2].image}
                  alt={content.collections[2].title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-primary/30 group-hover:bg-primary/40 transition-colors" />
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <h3 className="text-2xl font-black text-white uppercase max-w-[150px] leading-tight">
                    {content.collections[2].title}
                  </h3>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black -rotate-45 group-hover:rotate-0 transition-transform duration-300">
                    <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* === 3. Spotlight Assets (Horizontal Scroll/Grid) === */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[2px] w-8 bg-primary" />
                <span className="uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold text-slate-500">
                  Featured
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tight">
                Architectural <br /> Highlights.
              </h2>
            </div>
            <Link
              href={`/properties?status=For_${mode.charAt(0).toUpperCase() + mode.slice(1)}`}
            >
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-black border-b-2 border-slate-300 hover:border-black pb-1 transition-colors cursor-pointer">
                View Full Portfolio
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlightProperties.map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// === Export with Suspense Boundary ===
// Next.js requires components reading useSearchParams to be wrapped in Suspense
export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full bg-primary flex items-center justify-center text-white font-bold uppercase tracking-widest text-sm animate-pulse">
          Initializing Protocol...
        </div>
      }
    >
      <ExploreView />
    </Suspense>
  );
}
