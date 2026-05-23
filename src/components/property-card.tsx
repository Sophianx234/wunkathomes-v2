"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Location01Icon,
  BedSingle02Icon,
  Bathtub01Icon,
  MaximizeIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

// Updated to perfectly match the populated Mongoose schemas
export interface IProperty {
  _id?: string;
  id?: string;
  slug: string;
  title: string;
  description: string;
  price: number; 
  listingType: 'For_Rent' | 'For_Sale';
  status: 'Available' | 'Pending' | 'Rented' | 'Sold';
  features: {
    bedrooms: number;
    bathrooms: number;
    sizeSqm?: number; 
  };
  terms: {
    leaseTerm: string | null;
  };
  smartLock?: {
    hasSmartLock: boolean;
  };
  images: string[];
  property: {
    _id?: string;
    propertyType: 'Apartment_Building' | 'Commercial' | 'House' | 'Land';
    location: {
      region: string;
      area: string;
      city?: string;
    };
    coordinates?: {
      lat?: number;
      lng?: number;
    };
    
    landmarks?: string[];
    generalAmenities?: string[];
  };
}

interface PropertyCardProps {
  property: IProperty;
  index?: number;
}

export default function PropertyCard({
  property,
  index = 0,
}: PropertyCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Framer Motion variants for the smooth slide effect
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const paginate = (newDirection: number, e: React.MouseEvent) => {
    e.preventDefault(); // Prevents the <Link> from triggering
    e.stopPropagation();

    setDirection(newDirection);
    setCurrentImage((prev) => {
      let nextIndex = prev + newDirection;
      if (nextIndex < 0) nextIndex = property.images.length - 1;
      if (nextIndex >= property.images.length) nextIndex = 0;
      return nextIndex;
    });
  };

  // Helper to format price based on Rent vs Sale
  const formattedPrice = `$${property.price.toLocaleString()}`;
  const priceSuffix = property.terms.leaseTerm ? property.terms.leaseTerm.split('_').join(' ') : '';

  // Format Location string
  const locationString = property.property.location.city 
    ? `${property.property.location.area}, ${property.property.location.city}` 
    : `${property.property.location.area}, ${property.property.location.region}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="group flex flex-col w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* === Image Carousel Container === */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden mb-4 rounded-xl md:rounded-2xl bg-slate-100">
        
        {/* Clickable Area to view property (Using SLUG) */}
        <Link
          href={`/properties/${property.slug}`}
          className="absolute inset-0 z-0"
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentImage}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={property.images[currentImage] || '/placeholder.jpg'}
                alt={`${property.title} - Image ${currentImage + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </motion.div>
          </AnimatePresence>
        </Link>

        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest pointer-events-none">
          {property.property.propertyType.replace('_', ' ')}
        </div>

        {/* Floating Price Tag */}
        <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm font-black text-black tracking-tight text-sm pointer-events-none">
          {formattedPrice}
          <span className="text-xs font-medium text-slate-500 tracking-normal"> / {priceSuffix}</span>
        </div>

        {/* Navigation Arrows (Visible on Hover) */}
        <AnimatePresence>
          {isHovered && property.images.length > 1 && (
            <>
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={(e) => paginate(-1, e)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-black shadow-sm transition-all"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={(e) => paginate(1, e)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-black shadow-sm transition-all"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </motion.button>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
  {isHovered && property.images.length > 1 && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-1  left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-full backdrop-blur-md"
    >
      {property.images.map((_, i) => (
        <div
          key={i}
          className={`transition-all duration-300 rounded-full ${
            i === currentImage
              ? "w-2 h-2 bg-white"
              : "w-1.5 h-1.5 bg-white/50"
          }`}
        />
      ))}
    </motion.div>
  )}
</AnimatePresence>
      </div>

      {/* === Minimalist Content Container === */}
      <div className="flex flex-col flex-1 px-1">
        <div className="mb-3 cursor-pointer">
          {/* Linked via Slug */}
          <Link href={`/properties/${property.slug}`}>
            <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1 group-hover:text-black transition-colors line-clamp-1">
              {property.title}
            </h3>
          </Link>
          <p className="flex items-center gap-1.5 text-sm font-medium text-slate-500 line-clamp-1">
            <HugeiconsIcon icon={Location01Icon} size={14} />
            {locationString}
          </p>
        </div>

        {/* Elegant Specs Row */}
        <div className="flex items-center gap-4 text-slate-700 font-medium text-sm mt-auto pt-1">
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon
              icon={BedSingle02Icon}
              size={16}
              className="text-slate-400"
            />
            <span>{property.features.bedrooms}</span>
          </div>
          <span className="text-slate-300 text-[10px]">●</span>
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon
              icon={Bathtub01Icon}
              size={16}
              className="text-slate-400"
            />
            <span>{property.features.bathrooms}</span>
          </div>
          
          {property.features.sizeSqm && (
            <>
              <span className="text-slate-300 text-[10px]">●</span>
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon
                  icon={MaximizeIcon}
                  size={16}
                  className="text-slate-400"
                />
                <span>{property.features.sizeSqm} sqm</span>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}