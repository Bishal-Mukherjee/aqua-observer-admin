"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getSpeciesDisplayColor } from "@/constants/colorMaps";
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

import L from "leaflet";

import "leaflet/dist/leaflet.css";

const icon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface ReportingMapProps {
  longitude: number;
  latitude: number;
  locationName: string;
  species: Array<{ type: string }>;
  zoom?: number;
  height?: string;
  interactive?: boolean;
}

const transformSpeciesName = (rawType: string) => {
  return rawType
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const ReportingMap: React.FC<ReportingMapProps> = ({
  longitude,
  latitude,
  locationName,
  species,
  zoom = 13,
  height = "100%",
  interactive = false,
}) => {
  return (
    <div
      className="w-full h-full rounded-lg overflow-hidden"
      style={{ height }}
    >
      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom}
        className="h-full w-full"
        style={{ minHeight: "50%" }}
        maxZoom={interactive ? 18 : 14}
        minZoom={interactive ? 5 : 14}
        zoomControl={interactive}
        dragging={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[latitude, longitude]} icon={icon}>
          <Popup>
            <div>
              <div className="font-semibold text-sm mb-1">{locationName}</div>
              <div className="text-xs text-gray-600 mb-2">
                {latitude}, {longitude}
              </div>
              <div className="space-y-1">
                {species.map((spec, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className={cn(
                      "text-xs mr-1 border-none",
                      getSpeciesDisplayColor(spec.type)
                    )}
                  >
                    {transformSpeciesName(spec.type)}
                  </Badge>
                ))}
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default ReportingMap;
