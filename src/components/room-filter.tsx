"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Filter, Search } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AMENITIES, BEDROOM_OPTIONS } from "@/lib/constants";

interface RoomFiltersProps {
  onFilter: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  location: string;
  bedrooms: number | null;
  maxPrice: number;
  amenities: string[];
}

export function RoomFilters({ onFilter }: RoomFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: "",
    bedrooms: null,
    maxPrice: 5000,
    amenities: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleAmenityToggle = (amenity: string) => {
    const updated = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    handleFilterChange("amenities", updated);
  };

  const handleReset = () => {
    const reset = {
      search: "",
      location: "",
      bedrooms: null,
      maxPrice: 5000,
      amenities: [],
    };
    setFilters(reset);
    onFilter(reset);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card className="p-4 border border-border">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <HugeiconsIcon
              icon={Search}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"
            />
            <Input
              placeholder="Search rooms..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <HugeiconsIcon icon={Filter} className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </Card>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="p-6 border border-border space-y-6">
          {/* Location */}
          <div>
            <label className="block text-sm font-semibold mb-3">Location</label>
            <Input
              placeholder="Enter city or area..."
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            />
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-semibold mb-3">Bedrooms</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.bedrooms === null ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("bedrooms", null)}
              >
                Any
              </Button>
              {BEDROOM_OPTIONS.map((beds) => (
                <Button
                  key={beds}
                  variant={filters.bedrooms === beds ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("bedrooms", beds)}
                >
                  {beds}
                </Button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Max Price: ${filters.maxPrice}
            </label>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={filters.maxPrice}
              onChange={(e) =>
                handleFilterChange("maxPrice", Number.parseInt(e.target.value))
              }
              className="w-full appearance-none h-2 rounded-xl bg-primary"
              style={{
                accentColor: "black",
              }}
            />

            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>$0</span>
              <span>$5000+</span>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Amenities
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AMENITIES.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              Reset Filters
            </Button>
            <Button onClick={() => setShowFilters(false)} className="flex-1">
              Apply
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
