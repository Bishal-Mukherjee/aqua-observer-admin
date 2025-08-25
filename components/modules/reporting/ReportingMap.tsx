"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

export default function ReportingMap({ data }: { data: any[] }) {
  // Process data for location map
  const locationData = React.useMemo(() => {
    return data.map((report) => ({
      latitude: report.latitude,
      longitude: report.longitude,
      label: `${report.district.replace(/_/g, " ")} - ${report.villageOrGhat}`,
      species: report.species
        .map((s: any) => s.type.replace(/_/g, " "))
        .join(", "),
      submittedBy: report.submittedBy.name,
      observedAt: new Date(report.observed_at).toLocaleDateString(),
    }));
  }, [data]);

  // Calculate a sensible center for the map based on the locations.
  // Uses the midpoint of the latitude/longitude bounds (min/max) which
  // is less sensitive to outliers than a straight average.
  const calculateCenter = (
    locations: { latitude: number; longitude: number }[]
  ) => {
    const DEFAULT_CENTER: [number, number] = [22.5726, 88.3639];
    if (!locations || locations.length === 0) return DEFAULT_CENTER;

    const valid = locations.filter(
      (l) =>
        l &&
        typeof l.latitude === "number" &&
        typeof l.longitude === "number" &&
        !isNaN(l.latitude) &&
        !isNaN(l.longitude)
    );
    if (valid.length === 0) return DEFAULT_CENTER;

    const lats = valid.map((l) => l.latitude);
    const lngs = valid.map((l) => l.longitude);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    return [centerLat, centerLng] as [number, number];
  };

  const mapCenter = React.useMemo(
    () => calculateCenter(locationData),
    [locationData]
  );

  return (
    <MapContainer
      center={mapCenter}
      zoom={8}
      scrollWheelZoom={false}
      className="h-[450px] w-full z-1"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locationData.map((location, index) => (
        <Marker
          key={index}
          position={[location.latitude, location.longitude]}
          icon={icon}
        >
          <Popup>
            <div className="text-sm flex flex-col gap-1">
              <span className="font-semibold">{location.label}</span>
              <span className="text-gray-600">Species: {location.species}</span>
              <span className="text-gray-600">
                Submitted by: {location.submittedBy}
              </span>
              <span className="text-gray-600">Date: {location.observedAt}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
