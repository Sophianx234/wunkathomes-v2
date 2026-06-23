"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const mainImage = images[0];
  const topImage = images[1] || images[0];
  const bottomImage = images[2] || images[0];

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <>
      {/* === Cinematic Grid === */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-10 md:mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 md:gap-4 h-[40vh] md:h-[60vh] rounded-lg md:rounded-[2rem] overflow-hidden">
          <div
            onClick={() => {
              setCurrentIndex(0);
              setIsOpen(true);
            }}
            className="md:col-span-3 row-span-2 relative h-full w-full group overflow-hidden cursor-pointer"
          >
            <Image
              src={mainImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              priority
            />
          </div>

          <div
            onClick={() => {
              setCurrentIndex(1 % images.length);
              setIsOpen(true);
            }}
            className="hidden md:block col-span-1 row-span-1 relative h-full w-full group overflow-hidden cursor-pointer"
          >
            <Image
              src={topImage}
              alt={`${title} Interior`}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>

          <div
            onClick={() => {
              setCurrentIndex(2 % images.length);
              setIsOpen(true);
            }}
            className="hidden md:block col-span-1 row-span-1 relative h-full w-full group overflow-hidden cursor-pointer"
          >
            <Image
              src={bottomImage}
              alt={`${title} Detail`}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="text-white font-bold uppercase tracking-widest text-[10px] border border-white px-4 py-2 bg-black/50 backdrop-blur-sm">
                View All Media
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* === Full Screen Lightbox Modal === */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 z-50 text-white/70 hover:text-white transition-colors p-2 bg-black/50 rounded-full"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={28} />
            </button>

            {/* Active Image */}
            <div className="relative w-full max-w-7xl h-[80vh] px-4 md:px-16">
              <Image
                src={images[currentIndex]}
                alt={`${title} - Gallery ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white hover:text-black transition-colors p-3 hover:bg-white bg-black/50 border border-white/20 rounded-full"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={24} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white hover:text-black transition-colors p-3 hover:bg-white bg-black/50 border border-white/20 rounded-full"
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} size={24} />
                </button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white font-bold uppercase tracking-widest text-[10px] bg-black/50 border border-white/20 px-4 py-2 rounded-full backdrop-blur-md">
              {currentIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
