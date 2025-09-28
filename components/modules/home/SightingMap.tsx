"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetOverviewLocations } from "@/services/home";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { ExternalLink, Map, Activity, Filter } from "lucide-react";
import dayjs from "dayjs";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const toTitleCaseLabel = (text: string) =>
  text
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const LoadingSkeleton = () => (
  <Card className="shadow-none border-0">
    <CardHeader className="pb-4">
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="h-[500px]">
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full animate-pulse" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    </CardContent>
  </Card>
);

interface LocationData {
  id: string;
  latitude: string;
  longitude: string;
  villageOrGhat: string;
  block: string;
  district: string;
  submittedBy: string;
  submittedAt: string;
}

const HeatmapLayer = ({ data }: { data: LocationData[] }) => {
  const map = useMap();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const heatmapData = data.map((location) => [
      parseFloat(location.latitude),
      parseFloat(location.longitude),
      1,
    ]);

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

export default function SightingsMap({
  onMarkerClick,
}: {
  onMarkerClick: (location?: any) => void;
}) {
  const [selectedType, setSelectedType] = useState<"sightings" | "reportings">(
    "reportings"
  );
  const [selectedLimit, setSelectedLimit] = useState<number>(50);
  const [viewMode, setViewMode] = useState<"markers" | "heatmap">("markers");

  const { data, isLoading, error } = useGetOverviewLocations(
    selectedType,
    selectedLimit
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Card className="shadow-none border-0">
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center space-y-2">
            <div className="text-4xl">⚠️</div>
            <p className="text-red-600 font-medium">
              Failed to load location data
            </p>
            <p className="text-sm text-gray-500">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const locationData: LocationData[] = data?.result?.data || [];
  const metadata = data?.result?.metadata || {};
  const defaultCenter: [number, number] = [22.9868, 87.855];

  return (
    <Card className="shadow-none border-0">
      <CardHeader className="pb-4">
        <div className="space-y-4">
          {/* Title Section */}
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <span className="text-blue-600">📍</span>
              {toTitleCaseLabel(selectedType)} Map
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {metadata.total || 0} locations
              {viewMode === "heatmap" && " • Density view"}
            </p>
          </div>

          {/* Controls Section */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-50 rounded-lg p-1 w-fit">
              <Button
                variant={viewMode === "markers" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("markers")}
                className="h-8 px-3 text-xs"
              >
                <Map className="w-3 h-3 mr-1.5" />
                Markers
              </Button>
              <Button
                variant={viewMode === "heatmap" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("heatmap")}
                className="h-8 px-3 text-xs"
              >
                <Activity className="w-3 h-3 mr-1.5" />
                Heatmap
              </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select
                value={selectedType}
                onValueChange={(value: "sightings" | "reportings") =>
                  setSelectedType(value)
                }
              >
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sightings">Sightings</SelectItem>
                  <SelectItem value="reportings">Reportings</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedLimit.toString()}
                onValueChange={(value) => setSelectedLimit(parseInt(value))}
              >
                <SelectTrigger className="w-[80px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Map Container */}
        <div className="relative w-full h-[450px] rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          {locationData.length > 0 ? (
            <MapContainer
              center={defaultCenter}
              zoom={6}
              style={{ height: "100%", width: "100%" }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {viewMode === "heatmap" ? (
                <HeatmapLayer data={locationData} />
              ) : (
                locationData.map((location) => (
                  <Marker
                    key={location.id}
                    position={[
                      parseFloat(location.latitude),
                      parseFloat(location.longitude),
                    ]}
                  >
                    <Popup maxWidth={280} className="custom-popup">
                      <div className="p-1">
                        <div className="font-medium text-gray-900 mb-2 text-sm">
                          📍 {location.villageOrGhat}
                        </div>

                        <div className="text-xs text-gray-600 space-y-1 mb-3">
                          <div className="flex justify-between">
                            <span className="font-medium">Observer:</span>
                            <span>{location.submittedBy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Date:</span>
                            <span>
                              {dayjs(location.submittedAt).format(
                                "MMM D, YYYY"
                              )}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-7 text-xs"
                          onClick={() =>
                            onMarkerClick({ ...location, type: selectedType })
                          }
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))
              )}
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <div className="text-4xl">🗺️</div>
                <div>
                  <p className="text-gray-600 font-medium">No data available</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Try adjusting the filters
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Heatmap Legend */}
        {viewMode === "heatmap" && locationData.length > 0 && (
          <div className="flex justify-center">
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-700">
                  Density:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Low</span>
                  <div className="w-16 h-2 rounded-full bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500"></div>
                  <span className="text-xs text-gray-500">High</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
