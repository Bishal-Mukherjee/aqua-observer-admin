"use client";

import { memo, useMemo, useState, useEffect } from "react";
import { Expand, Map, Activity } from "lucide-react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import dayjs from "dayjs";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
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
import { Button } from "@/components/ui/button";
import MapSkeleton from "@/components/common/InteractiveMap/Skeleton";

const icon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const HeatmapLayer = ({ data }: { data: any[] }) => {
  const map = useMap();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const heatmapData = data
      .filter(
        (location) =>
          location.latitude &&
          location.longitude &&
          !isNaN(location.latitude) &&
          !isNaN(location.longitude)
      )
      .map((location) => [location.latitude, location.longitude, 1]);

    if (heatmapData.length === 0) return;

    const heatmapLayer = (L as any).heatLayer(heatmapData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: "#3b82f6",
        0.2: "#06b6d4",
        0.4: "#10b981",
        0.6: "#f59e0b",
        0.8: "#f97316",
        1.0: "#ef4444",
      },
    });

    heatmapLayer.addTo(map);

    return () => {
      map.removeLayer(heatmapLayer);
    };
  }, [map, data]);

  return null;
};

// Shared View Mode Toggle Component
const ViewModeToggle = ({
  viewMode,
  setViewMode,
  className = "",
}: {
  viewMode: "markers" | "heatmap";
  setViewMode: (mode: "markers" | "heatmap") => void;
  className?: string;
}) => (
  <div className={`bg-white rounded-lg shadow-md p-1 flex ${className}`}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={viewMode === "markers" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("markers")}
          className="h-8 w-8 p-0 cursor-pointer"
        >
          <Map className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Markers View</p>
      </TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={viewMode === "heatmap" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("heatmap")}
          className="h-8 w-8 p-0 cursor-pointer"
        >
          <Activity className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Heatmap View</p>
      </TooltipContent>
    </Tooltip>
  </div>
);

// Shared Heatmap Legend Component
const HeatmapLegend = ({ className = "" }: { className?: string }) => (
  <div
    className={`bg-white rounded-lg border border-gray-200 px-3 py-2 shadow-md ${className}`}
  >
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-700">Density:</span>
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500">Low</span>
        <div className="w-12 h-2 rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500"></div>
        <span className="text-xs text-gray-500">High</span>
      </div>
    </div>
  </div>
);

function InteractiveLocationMap({
  isLoading,
  data,
  title = "",
  onLocationSelect,
}: {
  isLoading: boolean;
  data: any[];
  title?: string;
  onLocationSelect: (params: string) => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"markers" | "heatmap">("markers");

  const locationData = useMemo(() => {
    return data.map((report) => ({
      id: report.id,
      latitude: parseFloat(report.latitude) || 0,
      longitude: parseFloat(report.longitude) || 0,
      label: `${report.district?.replace(/_/g, " ") || "Unknown"} - ${
        report.villageOrGhat || "Unknown"
      }`,
      species: Array.isArray(report.species)
        ? report.species
            .map((s: any) => s.type?.replace(/_/g, " ") || "Unknown")
            .join(", ")
        : "Unknown",
      submittedBy: report.submittedBy?.name || "Unknown",
      submittedAt: report.submittedAt,
      villageOrGhat: report.villageOrGhat || "Unknown",
      district: report.district || "Unknown",
    }));
  }, [data]);

  const MapComponent = ({ height = "h-[450px]" }: { height?: string }) => (
    <div className="relative w-full h-full">
      <MapContainer
        center={[25, 88]}
        zoom={6}
        minZoom={6}
        maxZoom={12}
        scrollWheelZoom={true}
        worldCopyJump={true}
        className={`${height} w-full z-1 relative`}
        key={`${isDialogOpen ? "dialog" : "regular"}-${viewMode}-map`}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {viewMode === "heatmap" ? (
          <HeatmapLayer data={locationData} />
        ) : (
          <MarkerClusterGroup chunkedLoading>
            {locationData.map((location, index) =>
              location.latitude &&
              location.longitude &&
              !isNaN(location.latitude) &&
              !isNaN(location.longitude) ? (
                <Marker
                  key={location.id || index}
                  position={[location.latitude, location.longitude]}
                  icon={icon}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 mb-2">
                        {location.label}
                      </div>

                      <div className="text-gray-600 space-y-1">
                        {location.species && location.species !== "Unknown" && (
                          <div>
                            <span className="font-medium">Species:</span>{" "}
                            {location.species}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Observer:</span>{" "}
                          {location.submittedBy}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>{" "}
                          {dayjs(location.submittedAt).format("MMMM D, YYYY")}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 h-7 text-xs cursor-pointer"
                        onClick={() => onLocationSelect(location.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}
          </MarkerClusterGroup>
        )}
      </MapContainer>

      {/* View Mode Toggle - Available in both collapsed and expanded views */}
      <ViewModeToggle
        viewMode={viewMode}
        setViewMode={setViewMode}
        className="absolute bottom-4 left-4 z-10"
      />

      {/* Heatmap Legend - Available in both collapsed and expanded views */}
      {viewMode === "heatmap" && locationData.length > 0 && (
        <HeatmapLegend className="absolute bottom-4 right-4 z-10" />
      )}
    </div>
  );

  return (
    <div className="relative w-full h-full">
      {!isLoading && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {/* Expand Map Button - Top Right */}
          <DialogTrigger asChild>
            <div className="absolute top-2 right-2 z-10 bg-white p-1 rounded-lg cursor-pointer hover:bg-gray-50 shadow-md">
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
              <DialogTitle className="capitalize">
                {String(title).toLowerCase()}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 h-full">
              <MapComponent height="h-[calc(90vh-80px)]" />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Collapsed Map View */}
      {isLoading ? <MapSkeleton /> : <MapComponent height="h-[100%]" />}
    </div>
  );
}

export default memo(InteractiveLocationMap);
