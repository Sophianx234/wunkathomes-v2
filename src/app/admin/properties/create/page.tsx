"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";

import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { GeocodingControl } from "@maptiler/geocoding-control/maptilersdk";
// Import Hugeicons core and specific icons
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Upload01Icon,
  Cancel01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Constants for new dropdowns and amenities
const GHANA_REGIONS = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
];

const COMMON_AMENITIES = [
  "Air Conditioning",
  "Swimming Pool",
  "Backup Generator",
  "24/7 Security",
  "Water Tank (Polytank)",
  "Fitted Kitchen",
  "Parking Space",
  "Gym",
  "Wi-Fi",
  "Balcony",
  "CCTV Surveillance",
  "Elevator",
];

export default function CreatePropertyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [hasSmartLock, setHasSmartLock] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Location State (Defaulting to Accra, Ghana)
  const [lng, setLng] = useState<string>("-0.1870");
  const [lat, setLat] = useState<string>("5.6037");

  // Map Refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const marker = useRef<maptilersdk.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (map.current || !mapContainer.current) return; // stops map from initializing more than once

    // REPLACE WITH YOUR ACTUAL MAPTILER API KEY
    maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_PUBLIC_KEY || "";

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [parseFloat(lng), parseFloat(lat)],
      zoom: 12,
      
    });

    // Add Geocoding Control (Search box)
    const gc = new GeocodingControl({
      apiKey: maptilersdk.config.apiKey,
      mapController: map.current,
      flyTo: true,
      placeholder: "Search for a location...",
    });
    map.current.addControl(gc, "top-left");

    // Initialize Draggable Marker
    marker.current = new maptilersdk.Marker({ color: "#09090b", draggable: true })
      .setLngLat([parseFloat(lng), parseFloat(lat)])
      .addTo(map.current);

    // Update state when marker is dragged
    marker.current.on("dragend", () => {
      const lngLat = marker.current?.getLngLat();
      if (lngLat) {
        setLng(lngLat.lng.toFixed(5));
        setLat(lngLat.lat.toFixed(5));
      }
    });

    // Update state and marker when map is clicked
    map.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      setLng(lng.toFixed(5));
      setLat(lat.toFixed(5));
      marker.current?.setLngLat([lng, lat]);
    });

    // Update state and marker when a search result is picked
    gc.on("pick", (event: any) => {
      if (event && event.center) {
        const [pickedLng, pickedLat] = event.center;
        setLng(pickedLng.toFixed(5));
        setLat(pickedLat.toFixed(5));
        marker.current?.setLngLat([pickedLng, pickedLat]);
      }
    });

  }, [lat, lng]);

  // Handle manual input changes for lat/lng to update map
  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLat(val);
    if (marker.current && map.current && !isNaN(parseFloat(val))) {
      marker.current.setLngLat([parseFloat(lng), parseFloat(val)]);
      map.current.flyTo({ center: [parseFloat(lng), parseFloat(val)] });
    }
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLng(val);
    if (marker.current && map.current && !isNaN(parseFloat(val))) {
      marker.current.setLngLat([parseFloat(val), parseFloat(lat)]);
      map.current.flyTo({ center: [parseFloat(val), parseFloat(lat)] });
    }
  };

  // Dropzone configuration for image uploads
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: 5242880, // 5MB
  });

  const removeFile = (indexToRemove: number) => {
    setFiles((files) => files.filter((_, index) => index !== indexToRemove));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities((prev) => [...prev, amenity]);
    } else {
      setSelectedAmenities((prev) => prev.filter((a) => a !== amenity));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => setIsSubmitting(false), 1500);
  };

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen bg-slate-50 font-sans">
      <div className="min-w-4xl w-full mx-auto p-6 md:p-8 space-y-6 pb-20">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* --- SECTION: ASSET DETAILS --- */}
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <h2 className="text-[18px] font-medium text-slate-900 mb-6 pb-3 border-b border-slate-200 flex items-center gap-2.5">
              Primary Details
            </h2>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[13px] font-medium text-slate-700">
                    Listing Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g. Master Bedroom with Balcony"
                    className="h-10 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-zinc-950 focus:border-transparent text-[14px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="listingType" className="text-[13px] font-medium text-slate-700">
                      Listing Type *
                    </Label>
                    <Select defaultValue="For_Rent">
                      <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-zinc-950 text-[14px]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="For_Rent">For Rent</SelectItem>
                        <SelectItem value="For_Sale">For Sale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propertyType" className="text-[13px] font-medium text-slate-700">
                      Property Type *
                    </Label>
                    <Select defaultValue="Apartment_Building">
                      <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-zinc-950 text-[14px]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Apartment_Building">Apartment</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[13px] font-medium text-slate-700">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of the property..."
                  className="min-h-[120px] bg-slate-50 border-slate-200 focus:ring-2 focus:ring-zinc-950 focus:border-transparent text-[14px] resize-y"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-[13px] font-medium text-slate-700">
                    Price (GHS) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    className="h-10 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-zinc-950 focus:border-transparent text-[14px]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leaseTerm" className="text-[13px] font-medium text-slate-700">
                    Lease Term
                  </Label>
                  <Select>
                    <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-zinc-950 text-[14px]">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="6_Months">6 Months</SelectItem>
                      <SelectItem value="1_Year">1 Year</SelectItem>
                      <SelectItem value="2_Years">2 Years</SelectItem>
                      <SelectItem value="3_Years_Plus">3 Years +</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-[13px] font-medium text-slate-700">
                    Initial Status
                  </Label>
                  <Select defaultValue="Available">
                    <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-zinc-950 text-[14px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* --- SECTION: LOCATION --- */}
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <h2 className="text-[18px] font-medium text-slate-900 mb-6 pb-3 border-b border-slate-200 flex items-center gap-2.5">
              Location & Coordinates
            </h2>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="region" className="text-[13px] font-medium text-slate-700">
                    Region *
                  </Label>
                  <Select>
                    <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-zinc-950 text-[14px]">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {GHANA_REGIONS.map((region) => (
                        <SelectItem key={region} value={region.replace(/\s+/g, "_")}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-[13px] font-medium text-slate-700">
                    City
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g. Accra"
                    className="h-10 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-zinc-950 text-[14px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area" className="text-[13px] font-medium text-slate-700">
                    Area / Neighborhood *
                  </Label>
                  <Input
                    id="area"
                    placeholder="e.g. East Legon"
                    className="h-10 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-zinc-950 text-[14px]"
                    required
                  />
                </div>
              </div>

              {/* MAPTILER INTERACTIVE MAP CONTAINER */}
              <div className="w-full h-[350px] relative rounded-lg border border-slate-200 overflow-hidden bg-slate-100 z-0">
                <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="lat" className="text-[13px] font-medium text-slate-700">
                    Latitude
                  </Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={lat}
                    onChange={handleLatChange}
                    placeholder="5.6037"
                    className="h-10 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-zinc-950 text-[14px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng" className="text-[13px] font-medium text-slate-700">
                    Longitude
                  </Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={lng}
                    onChange={handleLngChange}
                    placeholder="-0.1870"
                    className="h-10 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-zinc-950 text-[14px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- SECTION: FEATURES --- */}
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <h2 className="text-[18px] font-medium text-slate-900 mb-6 pb-3 border-b border-slate-200">
              Features & Amenities
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="beds" className="text-[13px] font-medium text-slate-700">
                    Bedrooms
                  </Label>
                  <Input
                    id="beds"
                    type="number"
                    min="0"
                    placeholder="0"
                    className="h-10 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-zinc-950 text-[14px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baths" className="text-[13px] font-medium text-slate-700">
                    Bathrooms
                  </Label>
                  <Input
                    id="baths"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="0"
                    className="h-10 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-zinc-950 text-[14px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size" className="text-[13px] font-medium text-slate-700">
                    Size (Sqm)
                  </Label>
                  <Input
                    id="size"
                    type="number"
                    placeholder="e.g. 120"
                    className="h-10 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-zinc-950 text-[14px]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[13px] font-medium text-slate-700">
                  Select General Amenities
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-2 p-5 rounded-lg border border-slate-200 bg-slate-50/50">
                  {COMMON_AMENITIES.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-3">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={(checked) =>
                          handleAmenityChange(amenity, checked as boolean)
                        }
                        className="data-[state=checked]:bg-zinc-950 data-[state=checked]:border-zinc-950"
                      />
                      <Label
                        htmlFor={`amenity-${amenity}`}
                        className="text-[13px] font-normal text-slate-700 cursor-pointer"
                      >
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* --- SECTION: MEDIA --- */}
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <h2 className="text-[18px] font-medium text-slate-900 mb-6 pb-3 border-b border-slate-200 flex items-center gap-2.5">
              <HugeiconsIcon
                icon={Upload01Icon}
                size={20}
                className="text-slate-400"
                strokeWidth={1.5}
              />
              Media Upload
            </h2>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
                ${
                  isDragActive
                    ? "border-zinc-950 bg-slate-100"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"
                }`}
            >
              <input {...getInputProps()} />
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mb-4 border border-slate-100">
                <HugeiconsIcon
                  icon={Upload01Icon}
                  size={24}
                  className="text-slate-500"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-[14px] font-medium text-slate-900 mb-1">
                Click or drag images to upload
              </p>
              <p className="text-[13px] text-slate-500">
                SVG, PNG, JPG or GIF (max. 5MB)
              </p>
            </div>

            {/* Uploaded Files Preview */}
            {files.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-square flex items-center justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* --- SECTION: ADVANCED & ACCESS --- */}
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <h2 className="text-[18px] font-medium text-slate-900 mb-6 pb-3 border-b border-slate-200 flex items-center gap-2.5">
              Access Control
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="space-y-0.5">
                  <Label className="text-[14px] font-medium text-slate-900">
                    Smart Lock Enabled
                  </Label>
                  <p className="text-[13px] text-slate-500">
                    Property requires digital access codes for viewing.
                  </p>
                </div>
                <Switch
                  checked={hasSmartLock}
                  onCheckedChange={setHasSmartLock}
                  className="data-[state=checked]:bg-zinc-950"
                />
              </div>

              {hasSmartLock && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Label htmlFor="accessInstructions" className="text-[13px] font-medium text-slate-700">
                    Access Instructions (Private)
                  </Label>
                  <Textarea
                    id="accessInstructions"
                    placeholder="e.g. Use code 4092# on the front door keypad. Keycard located in lockbox..."
                    className="min-h-[100px] bg-slate-50 border-slate-200 focus:ring-2 focus:ring-zinc-950 focus:border-transparent text-[14px]"
                  />
                  <p className="text-[12px] text-slate-500 mt-1">
                    This information is hidden from public queries.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* --- SUBMIT ACTIONS --- */}
          <div className="bg-white rounded-lg border border-slate-200 p-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[13px] text-slate-500 max-w-sm">
              By saving this asset, a unified unique slug will automatically be generated based on the title provided.
            </p>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button
                type="button"
                variant="outline"
                className="w-full md:w-auto h-11 px-6 rounded-md text-[14px] font-medium border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Discard
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto h-11 rounded-md px-8 text-[14px] font-medium hover:bg-zinc-800 bg-zinc-950 text-white transition-colors"
              >
                {isSubmitting ? (
                  <HugeiconsIcon icon={Loading03Icon} className="animate-spin mr-2" />
                ) : (
                  ""
                )}
                {isSubmitting ? "Processing..." : "Publish Asset"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}