"use client";

import React, { useEffect, useRef } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";

interface PropertyMapProps {
  lat?: number;
  lng?: number;
}

export default function PropertyMap({ lat, lng }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Fallback coordinates (Accra) if none exist in the database
    const finalLat = lat ?? 5.6037;
    const finalLng = lng ?? -0.1870;

    maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_PUBLIC_KEY || "";

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [finalLng, finalLat],
      zoom: 14, // Slightly closer zoom for viewing a specific property
    });

    // Add a static, non-draggable marker
    new maptilersdk.Marker({ color: "#000000" })
      .setLngLat([finalLng, finalLat])
      .addTo(map.current);

  }, [lat, lng]);

  return (
    <div className="w-full h-[250px] bg-zinc-100/50 rounded-lg border border-zinc-200/60 overflow-hidden relative z-0 mb-6">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
