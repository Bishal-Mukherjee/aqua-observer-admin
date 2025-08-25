"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const sightingsLocations = [
  { lat: 22.5726, lng: 88.3639, label: "Kolkata Sighting #1" },
  { lat: 22.585, lng: 88.3468, label: "Howrah Sighting #2" },
  { lat: 22.4745, lng: 88.3996, label: "Baruipur Sighting #3" },
  { lat: 22.8186, lng: 88.6298, label: "Kalyani Sighting #4" },
  { lat: 22.7041, lng: 88.3773, label: "Barrackpore Sighting #5" },
  { lat: 22.6717, lng: 88.4472, label: "Madhyamgram Sighting #6" },
  { lat: 22.4937, lng: 88.3219, label: "Maheshtala Sighting #7" },
  { lat: 22.9229, lng: 88.7471, label: "Ranaghat Sighting #8" },
];

const reportingsLocations = [
  { lat: 22.5726, lng: 88.3639, label: "Kolkata Report #1" },
  { lat: 22.585, lng: 88.3468, label: "Howrah Report #2" },
  { lat: 22.4745, lng: 88.3996, label: "Baruipur Report #3" },
  { lat: 22.8186, lng: 88.6298, label: "Kalyani Report #4" },
  { lat: 22.7041, lng: 88.3773, label: "Barrackpore Report #5" },
  { lat: 22.6717, lng: 88.4472, label: "Madhyamgram Report #6" },
  { lat: 22.4937, lng: 88.3219, label: "Maheshtala Report #7" },
  { lat: 22.9229, lng: 88.7471, label: "Ranaghat Report #8" },
  { lat: 22.9, lng: 88.52, label: "Bongaon Report #9" },
  { lat: 22.8, lng: 88.37, label: "Barasat Report #10" },
];

export default function SightingsMap() {
  const [selectedType, setSelectedType] = useState<"sightings" | "reportings">(
    "reportings"
  );

  const currentLocations =
    selectedType === "sightings" ? sightingsLocations : reportingsLocations;

  return (
    <Card className="shadow-none border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Binoculars className="w-5 h-5 text-slate-400" />
            <CardTitle className="text-lg font-semibold">
              Recent{" "}
              {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Map
            </CardTitle>
          </div>
          <div className="z-10">
            <Select
              value={selectedType}
              onValueChange={(value: "sightings" | "reportings") =>
                setSelectedType(value)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sightings">Sightings</SelectItem>
                <SelectItem value="reportings">Reportings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <MapContainer
          center={[22.5726, 88.3639]}
          zoom={10}
          scrollWheelZoom={false}
          className="h-[500px] w-full z-1"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {currentLocations.map((location, index) => (
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
