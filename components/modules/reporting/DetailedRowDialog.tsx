"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  User,
  Phone,
  ExternalLink,
  Image as ImageIcon,
  Building2,
  Bandage,
  Home,
  MapPinIcon,
  PawPrint,
  Siren,
  AlertCircle,
  Skull,
  AlertOctagon,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const icon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface ReportEntry {
  id: string;
  longitude: number;
  latitude: number;
  altitude: number;
  provider: string;
  district: string;
  block: string;
  villageOrGhat: string;
  species: Array<{
    type: string;
    adultMale: {
      stranded: number;
      injured: number;
      dead: number;
    };
    adultFemale: {
      stranded: number;
      injured: number;
      dead: number;
    };
    subAdult: {
      stranded: number;
      injured: number;
      dead: number;
    };
  }>;
  images: string[] | null;
  observed_at: string;
  type: string;
  submittedBy: {
    name: string;
    phoneNumber: string;
  };
}

interface DetailedRowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ReportEntry | null;
  onInvalidateReport?: (reportId: string) => void;
}

const getSpeciesDisplayColor = (speciesType: string) => {
  const colorMap: Record<string, string> = {
    INDIAN_SKIMMER: "bg-sky-50 text-sky-800 border-sky-300",
    SALTWATER_CROCODILE: "bg-emerald-50 text-emerald-800 border-emerald-300",
    SOFT_SHELLED_TURTLE: "bg-amber-50 text-amber-800 border-amber-300",
    HARD_SHELLED_TURTLE: "bg-orange-50 text-orange-800 border-orange-300",
    MARSH_CROCODILE: "bg-green-50 text-green-800 border-green-300",
    GHARIAL: "bg-purple-50 text-purple-800 border-purple-300",
    IRRAWADDY_DOLPHIN: "bg-blue-50 text-blue-800 border-blue-300",
    SMOOTH_COATED_OTTER: "bg-indigo-50 text-indigo-800 border-indigo-300",
    GANGETIC_DOLPHIN: "bg-cyan-50 text-cyan-800 border-cyan-300",
  };
  return colorMap[speciesType] || "bg-gray-50 text-gray-800 border-gray-300";
};

const transformSpeciesName = (rawType: string) => {
  return rawType
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const formatLocationName = (location: string) => {
  return location.replace(/_/g, " ");
};

const formatPhoneNumber = (phoneNumber: string) => {
  if (phoneNumber.startsWith("+91")) {
    return phoneNumber.replace(/(\+91)(\d{5})(\d{5})/, "$1 $2 $3");
  }
  if (phoneNumber.length === 10) {
    return `+91 ${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`;
  }
  return phoneNumber;
};

const formatDateTime = (isoString: string) => {
  const dateObj = new Date(isoString);
  return {
    date: dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

const getConditionBadge = (count: number, type: string) => {
  if (count === 0) return null;

  const colorMap = {
    stranded: "bg-yellow-50 text-yellow-800",
    injured: "bg-orange-50 text-orange-800",
    dead: "bg-red-50 text-red-800",
  };

  const iconMap = {
    stranded: <AlertCircle className="h-4 w-4 text-yellow-600" />,
    injured: <Bandage className="h-4 w-4 text-orange-600" />,
    dead: <Skull className="h-4 w-4 text-red-600" />,
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs border-none px-2",
        colorMap[type as keyof typeof colorMap]
      )}
    >
      {iconMap[type as keyof typeof iconMap]}&nbsp;
      {count}&nbsp;{type}
    </Badge>
  );
};

const LocationMap: React.FC<{
  longitude: number;
  latitude: number;
  locationName: string;
  species: Array<{ type: string }>;
}> = ({ longitude, latitude, locationName, species }) => {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        className="h-full w-full"
        style={{ minHeight: "50%" }}
        maxZoom={14}
        minZoom={14}
        zoomControl={false}
        dragging={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[latitude, longitude]} icon={icon}>
          <Popup>
            <div>
              <div className="font-semibold text-sm mb-1">{locationName}</div>
              <div className="text-xs text-gray-600 mb-2">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
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

export default function DetailedRowDialog({
  isOpen,
  onClose,
  reportData,
  onInvalidateReport,
}: DetailedRowDialogProps) {
  const [showInvalidateDialog, setShowInvalidateDialog] = useState(false);

  if (!reportData) return null;

  const { date, time } = formatDateTime(reportData.observed_at);

  const handleInvalidateClick = () => {
    setShowInvalidateDialog(true);
  };

  const handleConfirmInvalidate = () => {
    if (onInvalidateReport) {
      onInvalidateReport(reportData.id);
    }
    setShowInvalidateDialog(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="min-w-[90vw] max-h-[90vh] p-0"
          showCloseButton={false}
        >
          <div className="flex h-[85vh]">
            <div className="flex-1 flex flex-col bg-slate-50 rounded-md">
              <DialogHeader className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Siren className="h-5 w-5 text-red-600" />
                    Report
                    <Badge
                      variant="outline"
                      className={cn(
                        "ml-2 text-xs font-medium border-none",
                        reportData.type === "LIVE_REPORTING"
                          ? "bg-green-50 text-green-800"
                          : "bg-blue-50 text-blue-800"
                      )}
                    >
                      {reportData.type.split("_")[0]}
                    </Badge>
                  </DialogTitle>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleInvalidateClick}
                    className="h-8 px-3 text-xs cursor-pointer"
                  >
                    <AlertOctagon className="h-3.5 w-3.5 mr-1" />
                    Invalidate Report
                  </Button>
                </div>
              </DialogHeader>

              <ScrollArea className="h-[75vh] p-4">
                <Card className="border-none shadow-none mb-4">
                  <CardContent className="px-4 py-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {date}
                          </p>
                          <p className="text-xs text-gray-600">
                            Observation Date
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                          <Clock className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {time}
                          </p>
                          <p className="text-xs text-gray-600">Time</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="mb-4">
                  <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-1">
                    <MapPinIcon className="h-5 w-5 text-gray-500" />
                    Location Details
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <Card className="border-none shadow-none">
                      <CardContent className="px-4 py-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {formatLocationName(reportData.district)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  District
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">
                                  {formatLocationName(reportData.block)}
                                </p>
                                <p className="text-xs text-gray-500">Block</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-none">
                      <CardContent className="px-4 py-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                            <Home className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {reportData.villageOrGhat}
                            </p>
                            <p className="text-xs text-gray-500">
                              Village/Ghat
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                      <PawPrint className="h-5 w-5 text-gray-500" />
                      Species Observations
                    </h3>

                    <div className="flex items-center justify-center w-6 h-6 bg-slate-100 border text-slate-600 rounded-xl text-xs">
                      {reportData.species.length || 0}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {reportData.species.map((species, index) => (
                      <Card key={index} className="border-none shadow-none">
                        <CardContent className="px-4 py-0">
							<div className="flex items-center justify-between mb-4">
								<Badge
								variant="outline"
								className={cn(
									"text-sm font-medium border-none px-3 py-1",
									getSpeciesDisplayColor(species.type)
								)}
								>
								{transformSpeciesName(species.type)}
								</Badge>
							</div>

                          <div className="grid grid-cols-3 gap-6">
                            <div className="text-center">
                              <span className="font-medium text-gray-700 block mb-2 text-sm">
                                Adult Male
                              </span>
                              <div className="space-y-2 space-x-2">
                                {getConditionBadge(
                                  species.adultMale.stranded,
                                  "stranded"
                                )}
                                {getConditionBadge(
                                  species.adultMale.injured,
                                  "injured"
                                )}
                                {getConditionBadge(
                                  species.adultMale.dead,
                                  "dead"
                                )}
                                {species.adultMale.stranded === 0 &&
                                  species.adultMale.injured === 0 &&
                                  species.adultMale.dead === 0 && (
                                    <span className="text-gray-400 text-xs block">
                                      No observations
                                    </span>
                                  )}
                              </div>
                            </div>

                            <div className="text-center">
                              <span className="font-medium text-gray-700 block mb-2 text-sm">
                                Adult Female
                              </span>
                              <div className="space-y-0.5 space-x-1">
                                {getConditionBadge(
                                  species.adultFemale.stranded,
                                  "stranded"
                                )}
                                {getConditionBadge(
                                  species.adultFemale.injured,
                                  "injured"
                                )}
                                {getConditionBadge(
                                  species.adultFemale.dead,
                                  "dead"
                                )}
                                {species.adultFemale.stranded === 0 &&
                                  species.adultFemale.injured === 0 &&
                                  species.adultFemale.dead === 0 && (
                                    <span className="text-gray-400 text-xs block">
                                      No observations
                                    </span>
                                  )}
                              </div>
                            </div>

                            <div className="text-center">
                              <span className="font-medium text-gray-700 block mb-2 text-sm">
                                Sub Adult
                              </span>
                              <div className="space-y-2">
                                {getConditionBadge(
                                  species.subAdult.stranded,
                                  "stranded"
                                )}
                                {getConditionBadge(
                                  species.subAdult.injured,
                                  "injured"
                                )}
                                {getConditionBadge(
                                  species.subAdult.dead,
                                  "dead"
                                )}
                                {species.subAdult.stranded === 0 &&
                                  species.subAdult.injured === 0 &&
                                  species.subAdult.dead === 0 && (
                                    <span className="text-gray-400 text-xs block">
                                      No observations
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-gray-500" />
                      Images
                    </h3>

                    <div className="flex items-center justify-center w-6 h-6 bg-slate-100 border text-slate-600 rounded-xl text-xs">
                      {reportData.images?.length || 0}
                    </div>
                  </div>

                  {reportData.images && reportData.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {reportData.images.map((image, index) => (
                        <div
                          key={index}
                          className="aspect-video bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center hover:shadow-sm transition-shadow overflow-hidden"
                        >
                          <img
                            src={image}
                            alt={`Observation ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card className="shadow-none border-none py-0">
                      <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">
                          No images available for this report
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Separator className="my-4" />

                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    Reporter Information
                  </h3>

                  <div className="flex items-start justify-between pr-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {reportData.submittedBy.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700 font-mono text-sm">
                            {formatPhoneNumber(
                              reportData.submittedBy.phoneNumber
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/reports/${reportData.id}`}
                      className="text-blue-600 underline flex items-center text-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Other Reports
                    </Link>
                  </div>
                </div>

                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>

            <div className="w-1/2 border-l border-gray-200">
              <div className="h-full">
                <LocationMap
                  longitude={reportData.longitude}
                  latitude={reportData.latitude}
                  locationName={`${
                    reportData.villageOrGhat
                  }, ${formatLocationName(reportData.block)}`}
                  species={reportData.species}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showInvalidateDialog}
        onOpenChange={setShowInvalidateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Invalidate Report
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to invalidate this report? This action
              cannot be undone. The report will be marked as invalid and removed
              from active data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmInvalidate}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Invalidate Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
