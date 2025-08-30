"use client";

import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Expand, ExternalLink } from "lucide-react";
import "leaflet/dist/leaflet.css";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const icon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function ReportingMap({
  data,
  title = "",
  onMarkerClick,
}: {
  data: any[];
  title?: string;
  onMarkerClick: (params: any) => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Process data for location map
  const locationData = useMemo(() => {
    return data.map((report) => ({
      id: report.id,
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

  const mapCenter = useMemo(
    () => calculateCenter(locationData),
    [locationData]
  );

  const MapComponent = ({ height = "h-[450px]" }: { height?: string }) => (
    <MapContainer
      center={mapCenter}
      zoom={8}
      scrollWheelZoom={false}
      className={`${height} w-full z-1`}
      key={isDialogOpen ? "dialog-map" : "regular-map"} // Force re-render when switching contexts
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locationData.map((location, index) => (
        <Marker
          key={index}
          position={[location.latitude, location.longitude]}
          icon={icon}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-medium text-gray-900 mb-2">
                {location.label}
              </div>

              <div className="text-gray-600">
                <div>
                  <span className="font-medium">Species:</span>{" "}
                  {location.species}
                </div>
                <div>
                  <span className="font-medium">Observer:</span>{" "}
                  {location.submittedBy}
                </div>
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  {location.observedAt}
                </div>
              </div>

              <div
                className="flex items-center justify-start mt-2 cursor-pointer hover:underline"
                role="button"
                onClick={() => onMarkerClick(location)}
              >
                <ExternalLink className="w-3 h-3" />
                <span className="ml-1 text-xs text-blue-600 hover:text-blue-700">
                  View Details
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );

  return (
    <div className="relative">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <div className="absolute top-2 right-2 z-10 bg-white p-1 rounded-lg cursor-pointer hover:bg-gray-50">
            <Tooltip>
              <TooltipTrigger asChild>
                <Expand className="w-5 h-5" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Expand Map</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </DialogTrigger>

        <DialogContent className="min-w-[90vw] max-w-[95vw] h-[90vh]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full">
            <MapComponent height="h-[calc(90vh-80px)]" />
          </div>
        </DialogContent>
      </Dialog>
      <MapComponent />
    </div>
  );
}
