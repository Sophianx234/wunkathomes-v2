"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Location01Icon,
  BedSingle02Icon,
  Bathtub01Icon,
  MaximizeIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
  Delete01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatLeaseTerm } from "@/lib/helpers";
import { usePathname } from "next/navigation";

// --- Shadcn Imports ---
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deletePropertyAction } from "@/actions/user/property.action";

export interface IProperty {
  _id?: string;
  id?: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  listingType: "For_Rent" | "For_Sale";
  status: "Available" | "Pending" | "Rented" | "Sold";
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
    propertyType: "Apartment_Building" | "Commercial" | "House" | "Land";
    location: any;
    region?: string;
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

  // --- Deletion State & Transitions ---
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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
    e.preventDefault();
    e.stopPropagation();

    setDirection(newDirection);
    setCurrentImage((prev) => {
      let nextIndex = prev + newDirection;
      if (nextIndex < 0) nextIndex = property.images.length - 1;
      if (nextIndex >= property.images.length) nextIndex = 0;
      return nextIndex;
    });
  };

  // --- DELETE EXECUTION ---
  const handleDeleteConfirm = () => {
    const targetId = property._id || property.id;

    if (!targetId) {
      toast.error("Error: Missing property ID.");
      setIsDeleteDialogOpen(false);
      return;
    }

    startTransition(async () => {
      try {
        const result = await deletePropertyAction(targetId); 
        
        if (result.success) {
          setIsDeleteDialogOpen(false);
          toast.success(result.message);
        } else {
          toast.error(result.message || "Failed to delete property.");
          setIsDeleteDialogOpen(false);
        }
      } catch (error) {
        console.error("Delete Action Error:", error);
        toast.error("An unexpected error occurred.");
        setIsDeleteDialogOpen(false);
      }
    });
  };

  const formattedPrice = `₵${property.price.toLocaleString()}`;
  const priceSuffix = formatLeaseTerm(property.terms?.leaseTerm);

  let locationString = "Unknown Location";
  if (typeof property.property?.location === "string") {
    const region = property.property.region;
    locationString = region 
      ? `${property.property.location}, ${region}`
      : property.property.location;
  } else if (property.property?.location) {
    const loc = property.property.location;
    locationString = loc.city
      ? `${loc.area}, ${loc.city}`
      : `${loc.area}, ${loc.region}`;
  }

  const pathname = usePathname();
  const isAdminView = pathname.startsWith("/admin");

  const getHref = () => {
    if (isAdminView) {
      return `/admin/properties/${property.slug}`;
    }
    return `/properties/${property.slug}`;
  };

  const href = getHref();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
        className="group flex flex-col w-full min-w-0 max-w-full box-border relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* === Image Carousel Container === */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden mb-2 md:mb-4 rounded-lg md:rounded-lg bg-zinc-100/50 box-border">
          <Link href={href} className="absolute inset-0 z-0">
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
                  src={property.images[currentImage] || "/placeholder.jpg"}
                  alt={`${property.title} - Image ${currentImage + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </motion.div>
            </AnimatePresence>
          </Link>

          {/* Status Badge */}
          <div className="absolute top-2 md:top-3 left-2 md:left-3 z-10 bg-black/80 backdrop-blur-sm text-white px-1.5 md:px-2.5 py-0.5 md:py-1 rounded text-[7px] md:text-[10px] font-bold uppercase tracking-widest pointer-events-none">
            {property.property.propertyType.split("_")[0]}
          </div>

          {/* --- ADMIN QUICK ACTIONS (Dropdown) --- */}
          {isAdminView && (
            <div className="absolute top-2 md:top-3 right-2 md:right-3 z-20">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    onClick={(e) => e.stopPropagation()} 
                    className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm flex items-center justify-center text-zinc-700 shadow-sm transition-colors focus:outline-none"
                  >
                    <span className="scale-75 md:scale-100 flex items-center">
                      <HugeiconsIcon icon={MoreHorizontalIcon} size={18} />
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32 md:w-40 rounded-lg md:rounded-lg font-sans">
                  <DropdownMenuItem asChild className="cursor-pointer text-[10px] md:text-sm">
                    <Link href={`/admin/properties/${property.slug}/edit`} className="flex items-center gap-1.5 md:gap-2">
                      <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
                      Edit Details
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* UPDATE: Trigger Local Modal */}
                  <DropdownMenuItem 
                    className="cursor-pointer  text-[10px] md:text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={14} className="mr-1.5 md:mr-2" />
                    Delete Asset
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Floating Price Tag */}
          <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 z-10 bg-white/95 backdrop-blur-sm px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg shadow-sm font-black text-black tracking-tight text-[10px] md:text-sm font-tabular-nums pointer-events-none truncate max-w-[85%]">
            {formattedPrice}
            <span className="text-[8px] md:text-xs font-medium text-zinc-500 tracking-normal ml-0.5">
              {priceSuffix}
            </span>
          </div>

          {/* Navigation Arrows */}
          <AnimatePresence>
            {isHovered && property.images.length > 1 && (
              <>
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={(e) => paginate(-1, e)}
                  className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-black shadow-sm transition-all"
                >
                  <span className="scale-75 md:scale-100 flex items-center">
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                  </span>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={(e) => paginate(1, e)}
                  className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-black shadow-sm transition-all"
                >
                  <span className="scale-75 md:scale-100 flex items-center">
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                  </span>
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
                className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 md:gap-1.5 bg-black/20 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full backdrop-blur-md"
              >
                {property.images.map((_, i) => (
                  <div
                    key={i}
                    className={`transition-all duration-300 rounded-full ${
                      i === currentImage
                        ? "w-1.5 h-1.5 md:w-2 md:h-2 bg-white"
                        : "w-1 h-1 md:w-1.5 md:h-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* === Minimalist Content Container === */}
        <div className="flex flex-col flex-1 px-0.5 md:px-1 min-w-0 box-border">
          <div className="mb-1.5 md:mb-3 cursor-pointer min-w-0">
            <Link href={href}>
              <h3 className="text-sm md:text-lg font-bold text-zinc-900 leading-tight mb-0.5 md:mb-1 group-hover:text-black transition-colors truncate">
                {property.title}
              </h3>
            </Link>
            <p className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-sm font-medium text-zinc-500 truncate">
              <span className="scale-75 md:scale-100 flex items-center shrink-0">
                <HugeiconsIcon icon={Location01Icon} size={14} />
              </span>
              <span className="truncate">{locationString}</span>
            </p>
          </div>

          {/* Elegant Specs Row */}
          <div className="flex items-center gap-2 md:gap-4 text-zinc-700 font-medium text-[10px] md:text-sm mt-auto pt-0.5 md:pt-1 min-w-0 box-border">
            <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
              <span className="scale-75 md:scale-100 flex items-center shrink-0">
                <HugeiconsIcon
                  icon={BedSingle02Icon}
                  size={16}
                  className="text-zinc-400"
                />
              </span>
              <span className="truncate">{property.features.bedrooms}</span>
            </div>
            <span className="text-zinc-300 text-[6px] md:text-[10px] shrink-0">●</span>
            <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
              <span className="scale-75 md:scale-100 flex items-center shrink-0">
                <HugeiconsIcon
                  icon={Bathtub01Icon}
                  size={16}
                  className="text-zinc-400"
                />
              </span>
              <span className="truncate">{property.features.bathrooms}</span>
            </div>

            {property.features.sizeSqm && (
              <>
                <span className="text-zinc-300 text-[6px] md:text-[10px] shrink-0">●</span>
                <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
                  <span className="scale-75 md:scale-100 flex items-center shrink-0">
                    <HugeiconsIcon
                      icon={MaximizeIcon}
                      size={16}
                      className="text-zinc-400"
                    />
                  </span>
                  <span className="truncate">{property.features.sizeSqm} sqm</span>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* --- WARNING MODAL --- */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
              <AlertDialogTitle className="text-zinc-900 text-base md:text-xl font-bold">
                Delete Property Asset?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-zinc-600 text-[11px] md:text-sm leading-relaxed">
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-bold text-zinc-900">{property.title}</span>,
              including all media, smart lock configurations, and listing data from the database. 
              <br/><br/>
              <span className="text-red-700 font-medium">Warning:</span> If there are active leases tied to this asset, they will be orphaned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 md:mt-6 w-full flex gap-16 sm:gap-0">
            <AlertDialogCancel 
              disabled={isPending}
              className="bg-white text-zinc-700 hover:bg-zinc-50/50 border-zinc-200/60 mt-0 h-8 md:h-10 text-[11px] md:text-sm rounded-lg"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isPending}
              className="bg-black text-white hover:bg-zinc-800 focus:ring-zinc-800 min-w-[120px] md:min-w-[140px] h-8 md:h-10 text-[11px] md:text-sm rounded-lg m-0"
            >
              {isPending ? (
                <>
                  <span className="scale-75 md:scale-100 flex items-center mr-1 md:mr-2">
                    <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
                  </span>
                  Deleting...
                </>
              ) : (
                "Yes, Delete Asset"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
