// src/app/admin/properties/create/MapComponent.tsx
"use client"; // REQUIRED

import React, { useEffect } from "react";
// It is now safe to use standard imports here
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

// Import CSS
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";

// Dynamic Imports helper components defined locally within the client component
const ACCRA_CENTROID: [number, number] = [5.6037, -0.187];

interface MapComponentProps {
  coordinates: { lat: number; lng: number };
  setCoords: (coords: { lat: number; lng: number }) => void;
}

// Helper: Map Click Events
function MapEventsHandler({ setCoords }: { setCoords: MapComponentProps['setCoords'] }) {
  const map = useMapEvents({
    click(e) {
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return null;
}

// Helper: Search Control
function SearchField({ setCoords }: { setCoords: MapComponentProps['setCoords'] }) {
  const map = useMapEvents({});

  useEffect(() => {
    // @ts-ignore
    const provider = new OpenStreetMapProvider({
      params: {
        'accept-language': 'en',
        countrycodes: 'gh',
      },
    });
    // @ts-ignore
    const searchControl = new GeoSearchControl({
      provider: provider,
      style: "bar",
      showMarker: false,
      showPopup: false,
      autoClose: true,
      searchLabel: "Search location in Ghana...",
    });

    map.addControl(searchControl);

    map.on("geosearch/showlocation", (result: any) => {
      setCoords({ lat: result.location.y, lng: result.location.x });
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, setCoords]);

  return null;
}

// THE MAIN EXPORT
export default function MapComponent({ coordinates, setCoords }: MapComponentProps) {
  // Leaflet Icon fix setup - must happen inside client component
  useEffect(() => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 z-0 relative leaflet-custom-search">
      <MapContainer
        center={ACCRA_CENTROID}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coordinates.lat, coordinates.lng]} draggable={false} />
        <MapEventsHandler setCoords={setCoords} />
        <SearchField setCoords={setCoords} />
      </MapContainer>
    </div>
  );
}