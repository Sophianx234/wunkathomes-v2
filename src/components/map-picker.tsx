"use client";

import React, { useState, useEffect, useRef } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { GeocodingControl } from "@maptiler/geocoding-control/maptilersdk";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MapPicker() {
  const [lng, setLng] = useState<string>("-0.1870");
  const [lat, setLat] = useState<string>("5.6037");

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const marker = useRef<maptilersdk.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_PUBLIC_KEY || "";

    const mapInstance = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [parseFloat(lng), parseFloat(lat)],
      zoom: 12,
    });
    
    map.current = mapInstance;

    const gc = new GeocodingControl({
      apiKey: maptilersdk.config.apiKey,
      mapController: mapInstance,
      flyTo: true,
      placeholder: "Search for a location...",
    });
    mapInstance.addControl(gc, "top-left");

    const markerInstance = new maptilersdk.Marker({ color: "#09090b", draggable: true })
      .setLngLat([parseFloat(lng), parseFloat(lat)])
      .addTo(mapInstance);
      
    marker.current = markerInstance;

    markerInstance.on("dragend", () => {
      const lngLat = markerInstance.getLngLat();
      if (lngLat) {
        setLng(lngLat.lng.toFixed(5));
        setLat(lngLat.lat.toFixed(5));
      }
    });

    mapInstance.on("click", (e) => {
      const { lng: newLng, lat: newLat } = e.lngLat;
      setLng(newLng.toFixed(5));
      setLat(newLat.toFixed(5));
      markerInstance.setLngLat([newLng, newLat]);
    });

    gc.on("pick", (event: any) => {
      if (event && event.center) {
        const [pickedLng, pickedLat] = event.center;
        setLng(pickedLng.toFixed(5));
        setLat(pickedLat.toFixed(5));
        markerInstance.setLngLat([pickedLng, pickedLat]);
      }
    });
    
    return () => {
      mapInstance.remove();
      map.current = null;
    };
  }, []); // Run only once on mount

  return (
    <>
      {/* Hidden inputs ensure coordinate data is submitted with the main Server Form */}
      <input type="hidden" name="lat" value={lat} />
      <input type="hidden" name="lng" value={lng} />

      <div className="w-full h-[350px] relative rounded-lg border border-slate-200 overflow-hidden bg-slate-100 z-0">
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-[13px] font-medium text-slate-700">Latitude</Label>
          <Input type="number" step="any" value={lat} readOnly className="h-10 bg-slate-100 text-[14px]" />
        </div>
        <div className="space-y-2">
          <Label className="text-[13px] font-medium text-slate-700">Longitude</Label>
          <Input type="number" step="any" value={lng} readOnly className="h-10 bg-slate-100 text-[14px]" />
        </div>
      </div>
    </>
  );
}
