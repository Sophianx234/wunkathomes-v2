"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import Navbar from "@/components/navbar";
import { IRoom } from "@/components/room-card";
import { RoomFilters } from "@/components/room-filter";
import Footer from "@/components/footer";

// ✅ Dynamically import Header and Footer to avoid SSR mismatches

export default function BrowsePage() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: "",
    bedrooms: null,
    maxPrice: 5000,
    amenities: [],
  });
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // ✅ Fetch rooms from backend API when filters change
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (filters.search) params.append("search", filters.search);
        if (filters.location) params.append("location", filters.location);
        if (filters.bedrooms) params.append("bedrooms", String(filters.bedrooms));
        if (filters.maxPrice) params.append("maxPrice", String(filters.maxPrice));
        if (filters.amenities.length > 0)
          params.append("amenities", filters.amenities.join(","));

        const res = await fetch(`/api/rooms/search?${params.toString()}`);
        const data = await res.json();

        if (res.ok) {
          console.log("Fetched rooms:", data);
          setRooms(data.data || []);
        } else {
          setError(data.message || "Failed to load rooms.");
        }
      } catch (err) {
        setError("Error fetching rooms. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [filters]);

  // ✅ Paginate results client-side
  const totalPages = useMemo(
    () => Math.ceil(rooms.length / itemsPerPage),
    [rooms]
  );
  const paginatedRooms = useMemo(
    () => rooms.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [rooms, page]
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Browse Hero */}
         <div
  className="relative bg-[url('/a-1.jpg')] bg-cover bg-center bg-no-repeat"
  
>
  {/* Overlay */}
   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

  {/* Content */}
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-white text-center">
    <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
      Browse Rooms
    </h1>
    <p className="text-lg text-gray-200">
      Explore {rooms.length} available rooms across the country
    </p>
  </div>
</div>


        {/* Listings */}
        <section className="py-12 md:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-20">
                  <RoomFilters onFilter={setFilters} />
                </div>
              </div>

              {/* Room Grid */}
              <div className="lg:col-span-3">
                {loading ? (
                  <div className="text-center py-16 text-muted-foreground">
                    Loading rooms...
                  </div>
                ) : error ? (
                  <div className="text-center py-16 text-red-500">
                    {error}
                  </div>
                ) : rooms.length > 0 ? (
                  <>
                    <div className="mb-6 text-sm text-muted-foreground">
                      Showing {(page - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(page * itemsPerPage, rooms.length)} of{" "}
                      {rooms.length} rooms
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                      {paginatedRooms.map((room:IRoom) => (
                        <RoomCard key={room._id} room={room} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center gap-2 flex-wrap">
                        {Array.from({ length: totalPages }).map((_, idx) => (
                          <Button
                            key={idx + 1}
                            variant={
                              page === idx + 1 ? "default" : "outline"
                            }
                            onClick={() => {
                              setPage(idx + 1);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            {idx + 1}
                          </Button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-lg text-muted-foreground mb-4">
                      No rooms found matching your filters.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setFilters({
                          search: "",
                          location: "",
                          bedrooms: null,
                          maxPrice: 5000,
                          amenities: [],
                        })
                      }
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
