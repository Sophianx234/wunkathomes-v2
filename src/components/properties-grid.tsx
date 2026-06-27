"use client";

import { useState, useEffect } from "react";
import PropertyCard, { IProperty } from "@/components/property-card";
import { getAdminProperties } from "@/actions/shared/fetch-properties.action";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown01Icon, Loading03FreeIcons } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface PropertiesGridProps {
  initialListings: IProperty[];
  initialHasMore: boolean;
  params: { [key: string]: string | undefined };
}

export default function PropertiesGrid({ initialListings, initialHasMore, params }: PropertiesGridProps) {
  const [items, setItems] = useState<IProperty[]>(initialListings);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state when props change due to URL/Server Component re-render
  useEffect(() => {
    setItems(initialListings);
    setHasMore(initialHasMore);
    setPage(1);
  }, [initialListings, initialHasMore]);

  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const { properties, hasMore: newHasMore } = await getAdminProperties(nextPage, 12, params);
      
      setItems((prev) => [...prev, ...properties]);
      setPage(nextPage);
      setHasMore(newHasMore);
    } catch (error) {
      console.error("Failed to fetch more properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!items.length) {
    return (
      <p className="text-zinc-500 text-center py-16">
        No properties found.
      </p>
    );
  }

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
        {items.map((listing: IProperty, index: number) => (
          <PropertyCard
            key={`${listing.id}-${index}`}
            property={listing}
            index={index}
          />
        ))}
      </section>

      <AnimatePresence>
        {hasMore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-16 md:mt-16 flex justify-center"
          >
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="px-10 py-4 bg-transparent text-primary font-bold uppercase tracking-widest text-xs border-2 border-black hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                <HugeiconsIcon icon={Loading03FreeIcons} className="size-4 animate-spin" /> loading properties
                </>
              ) : (
                <>
                  show more properties
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={16}
                    className="group-hover:translate-y-1 transition-transform"
                  />
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
