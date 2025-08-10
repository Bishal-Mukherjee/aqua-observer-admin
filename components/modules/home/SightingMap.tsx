"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Binoculars } from "lucide-react";
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

const locations = [
  { lat: 22.5726, lng: 88.3639, label: "Kolkata" },
  { lat: 22.585, lng: 88.3468, label: "Howrah" },
  { lat: 22.4745, lng: 88.3996, label: "Baruipur" },
  { lat: 22.8186, lng: 88.6298, label: "Kalyani" },
  { lat: 22.7041, lng: 88.3773, label: "Barrackpore" },
  { lat: 22.6717, lng: 88.4472, label: "Madhyamgram" },
  { lat: 22.4937, lng: 88.3219, label: "Maheshtala" },
  { lat: 22.9229, lng: 88.7471, label: "Ranaghat" },
  { lat: 22.9, lng: 88.52, label: "Bongaon" },
  { lat: 22.8, lng: 88.37, label: "Barasat" },
];

export default function SightingsMap() {
  return (
    <Card className="shadow-none border-0">
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Binoculars className="w-5 h-5 text-slate-400 mb-2" />
          <h3 className="text-sm font-semibold mb-2">Recent Sightings Map</h3>
        </div>
        <MapContainer
          center={[22.5726, 88.3639]}
          zoom={10}
          scrollWheelZoom={false}
          className="h-[500px] w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {locations.map((location, index) => (
            <Marker
              key={index}
              position={[location.lat, location.lng]}
              icon={icon}
            >
              <Popup>{location.label}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </CardContent>
    </Card>
  );
}
