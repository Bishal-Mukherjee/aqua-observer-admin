"use client";

import React, { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  CheckCircle,
  Droplets,
  Cloud,
  Shield,
  Fish,
  FileText,
  Binoculars,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getSpeciesDisplayColor } from "@/constants/colorMaps";
import {
  useGetReportingById,
  useToogleReportingStatus,
} from "@/services/reportings";
import {
  useGetSightingById,
  useToogleSightingStatus,
} from "@/services/sightings";
import { formatPhoneNumber } from "@/lib/strings";
import DetailedDialogSkeleton, {
  MapSkeleton,
} from "@/components/common/SubmissionDialog/Skeleton";
import ActionAlert from "@/components/common/SubmissionDialog/ActionAlert";
import { SignedImage } from "@/components/common/SignedImage";

const SubmissionMap = dynamic(
  () => import("@/components/common/SubmissionDialog/SubmissionMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading map...</div>
      </div>
    ),
  }
);

dayjs.extend(utc);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface SubmissionDialogProps {
  onClose: () => void;
  submissionId: string | null;
  speciesData?: any;
  hideOtherSubmissions?: boolean;
  type?: "REPORTING" | "SIGHTING";
}

const transformSpeciesName = (rawType: string) => {
  return rawType
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const formatCause = (cause: string) => {
  return cause
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatLocationName = (location: string) => {
  return location.replace(/_/g, " ");
};

const formatObservationDate = (isoString: string) => {
  return dayjs(isoString).format("DD MMMM, YYYY");
};

const formatObservationTime = (isoString: string) => {
  return dayjs(isoString).format("hh:mm A");
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

const ageGroupMap: Record<string, string> = {
  adult: "Adult",
  subAdult: "Juvenile",
  adultMale: "Adult Male",
  adultFemale: "Adult Female",
  unidentified: "Unidentified",
};

// Component for rendering species data for reporting (with conditions)
const ReportingSpeciesCard = ({ species, speciesData, causes }: any) => {
  const mergedSpeciesData = useMemo(() => {
    if (!species || !speciesData) return [];

    return species.map((speciesItem: any) => {
      const ageGroup = speciesData.find(
        (s: any) => s.value === speciesItem.type
      )?.ageGroup;

      return {
        type: speciesItem.type,
        data:
          ageGroup === "trio"
            ? {
                adultMale: speciesItem.adultMale,
                adultFemale: speciesItem.adultFemale,
                subAdult: speciesItem.subAdult,
              }
            : {
                adult: speciesItem.adult,
                subAdult: speciesItem.subAdult,
              },
        causes:
          causes?.find((cause: any) => cause.species === speciesItem.type) ||
          {},
      };
    });
  }, [species, speciesData, causes]);

  // Optimized: Render causes for a species
  const renderCauses = (speciesType: string) => {
    const speciesCauses =
      mergedSpeciesData.find((s: any) => s.type === speciesType)?.causes || {};
    const { cause = [], otherCause } = speciesCauses;

    if ((!cause || cause.length === 0) && !otherCause) return null;

    return (
      <div className="mt-4 w-full flex items-center gap-2">
        <h4 className="text-xs font-medium text-gray-600">Causes:</h4>
        <div className="flex flex-wrap gap-1">
          {cause
            ?.filter((c: string) => c !== "OTHER")
            .map((c: string, idx: number) => (
              <Badge
                key={idx}
                variant="outline"
                className="bg-amber-50 text-amber-800 border-amber-300 text-xs"
              >
                {formatCause(c)}
              </Badge>
            ))}
          {otherCause && (
            <Badge
              variant="outline"
              className="bg-gray-50 text-gray-800 border-gray-300 text-xs"
            >
              {otherCause}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {mergedSpeciesData.map((species: any, index: number) => (
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

            <div className="grid grid-cols-3 gap-6 pt-2">
              {Object.entries(species.data).map(([ageGroup, details]: any) => (
                <div key={ageGroup} className="text-center">
                  <span className="font-medium text-gray-700 block mb-2 text-sm">
                    {ageGroupMap[ageGroup] || ageGroup}
                  </span>
                  <div className="space-y-0.5 space-x-1">
                    {getConditionBadge(details.stranded, "stranded")}
                    {getConditionBadge(details.injured, "injured")}
                    {getConditionBadge(details.dead, "dead")}
                    {details.stranded === 0 &&
                      details.injured === 0 &&
                      details.dead === 0 && (
                        <span className="text-gray-400 text-xs block">
                          No observations
                        </span>
                      )}
                  </div>
                </div>
              ))}
            </div>

            {renderCauses(species.type)}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Component for rendering species data for sighting (just counts)
const SightingSpeciesCard = ({ species }: any) => {
  return (
    <div className="space-y-2">
      {species.map((speciesItem: any, index: number) => (
        <Card key={index} className="border-none shadow-none">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className={cn(
                  "text-sm font-medium border-none px-3 py-1",
                  getSpeciesDisplayColor(speciesItem.type)
                )}
              >
                {transformSpeciesName(speciesItem.type)}
              </Badge>

              <div className="flex gap-4 text-sm">
                {speciesItem.adult > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-700">Adult:</span>
                    <span className="text-gray-900">{speciesItem.adult}</span>
                  </div>
                )}
                {speciesItem.subAdult > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-700">Juvenile:</span>
                    <span className="text-gray-900">
                      {speciesItem.subAdult}
                    </span>
                  </div>
                )}
                {speciesItem.adultMale > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-700">Male:</span>
                    <span className="text-gray-900">
                      {speciesItem.adultMale}
                    </span>
                  </div>
                )}
                {speciesItem.adultFemale > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-700">Female:</span>
                    <span className="text-gray-900">
                      {speciesItem.adultFemale}
                    </span>
                  </div>
                )}
                {speciesItem.unidentified > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-700">
                      Unidentified:
                    </span>
                    <span className="text-gray-900">
                      {speciesItem.unidentified}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Component for additional sighting details
const SightingDetailsSection = ({ reportData }: any) => {
  const formatEnumValue = (value: string) => {
    return value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const hasNoneThreats =
    reportData.threats &&
    reportData.threats.length === 1 &&
    reportData.threats[0] === "NONE";

  return (
    <>
      {/* Water Body & Conditions */}
      <div className="mb-4">
        <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Droplets className="h-5 w-5 text-gray-500" />
          Environment Details
        </h3>

        <div className="grid grid-cols-1 gap-2">
          <Card className="border-none shadow-none">
            <CardContent className="px-4 py-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Droplets className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {reportData?.waterBody
                        ?.map((condition: string) => formatEnumValue(condition))
                        .join(", ")}
                    </p>
                    <p className="text-xs text-gray-500">Water Body</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-50 rounded-full flex items-center justify-center">
                    <Droplets className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatEnumValue(reportData.waterBodyCondition)}
                    </p>
                    <p className="text-xs text-gray-500">Water Condition</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-none">
            <CardContent className="px-4 py-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                  <Cloud className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {reportData?.weatherCondition
                      ?.map((condition: string) => formatEnumValue(condition))
                      .join(", ")}
                  </p>
                  <p className="text-xs text-gray-500">Weather</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Threats */}
      {reportData.threats && reportData.threats.length > 0 && (
        <div className="mb-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-500" />
            Threats Identified
          </h3>

          {hasNoneThreats ? (
            <p className="text-sm text-gray-600 mb-2">No threats identified.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {reportData.threats.map((threat: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-red-50 text-red-800 border-red-300"
                >
                  {formatEnumValue(threat)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fishing Gears */}
      {reportData.fishingGears && reportData.fishingGears.length > 0 && (
        <div className="mb-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Fish className="h-5 w-5 text-gray-500" />
            Fishing Gears Observed
          </h3>

          <div className="flex flex-wrap gap-2">
            {reportData.fishingGears.map((gear: string, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-blue-50 text-blue-800 border-blue-300"
              >
                {formatEnumValue(gear)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default function SubmissionDialog({
  onClose,
  submissionId,
  speciesData,
  hideOtherSubmissions = false,
  type = "REPORTING",
}: SubmissionDialogProps) {
  const queryClient = useQueryClient();

  // API calls based on type
  const { data: reportingData, isLoading: isReportingLoading } =
    useGetReportingById(type === "REPORTING" ? submissionId : null);
  const { data: sightingData, isLoading: isSightingLoading } =
    useGetSightingById(type === "SIGHTING" ? submissionId : null);

  // Mutation hooks
  const { mutate: toggleReportingStatus, isPending: isToggleReportingLoading } =
    useToogleReportingStatus();
  const { mutate: toggleSightingStatus, isPending: isToggleSightingLoading } =
    useToogleSightingStatus();

  const [action, setAction] = useState<"validate" | "invalidate" | null>(null);

  // Determine which data to use and loading state
  const data = type === "REPORTING" ? reportingData : sightingData;
  const isLoading =
    type === "REPORTING" ? isReportingLoading : isSightingLoading;
  const isToggleLoading =
    type === "REPORTING" ? isToggleReportingLoading : isToggleSightingLoading;

  const reportData = data?.result;

  // Determine if this is a sighting based on data structure or type prop
  const isSighting =
    type === "SIGHTING" ||
    reportData?.submissionContext === "LIVE_SIGHTING" ||
    reportData?.waterBody !== undefined;

  const handleActionClick = () => {
    if (reportData?.isValid) {
      setAction("invalidate");
    } else {
      setAction("validate");
    }
  };

  const handleImageClick = (
    e: React.MouseEvent<HTMLImageElement>,
    imageUrl: string
  ) => {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`
      <html>
        <head>
          <title>Image Preview</title>
          <style>
            body {
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              background: #000000;
            }
            img {
              width: 60vw;
              height: 60vh;
			  object-fit: contain;
              display: block;
            }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" alt="Preview" />
        </body>
      </html>
    `);
    }
  };

  const handleConfirm = () => {
    if (submissionId) {
      const mutation =
        type === "REPORTING" ? toggleReportingStatus : toggleSightingStatus;
      const queryKey = type === "REPORTING" ? ["reportings"] : ["sightings"];

      mutation(
        { id: submissionId },
        {
          onSuccess: () => {
            toast.success(
              `${
                isSighting ? "Sighting" : "Report"
              } status updated successfully`
            );
          },
          onError: () => {
            toast.error(
              `Failed to update ${
                isSighting ? "sighting" : "report"
              } status. Please try again.`
            );
          },
          onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
            setAction(null);
            onClose();
          },
        }
      );
    }
  };

  const isValidReport = reportData?.isValid;

  return (
    <>
      <Dialog open={!!submissionId} onOpenChange={onClose}>
        <DialogContent
          className="min-w-[90vw] max-h-[90vh] p-0"
          showCloseButton={false}
        >
          <div className="flex h-[85vh]">
            <div className="flex-1 flex flex-col bg-slate-50 rounded-md">
              <DialogHeader className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    {isSighting ? (
                      <Binoculars className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Siren className="h-5 w-5 text-red-600" />
                    )}
                    {isSighting ? "Sighting" : "Report"}
                    {!isLoading && reportData && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "ml-2 text-xs font-medium border-none",
                          isSighting
                            ? "bg-blue-50 text-blue-800"
                            : reportData.type === "LIVE_REPORTING"
                            ? "bg-green-50 text-green-800"
                            : "bg-blue-50 text-blue-800"
                        )}
                      >
                        {reportData?.type?.split("_")[0]}
                      </Badge>
                    )}
                  </DialogTitle>

                  {!isLoading && reportData ? (
                    <Button
                      variant={isValidReport ? "destructive" : "success"}
                      size="sm"
                      onClick={handleActionClick}
                      className={cn("h-8 px-3 text-xs cursor-pointer")}
                    >
                      {isValidReport ? (
                        <>
                          <AlertOctagon className="h-3.5 w-3.5 mr-1" />
                          Invalidate {isSighting ? "Sighting" : "Report"}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Validate {isSighting ? "Sighting" : "Report"}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Skeleton className="h-8 w-32 rounded-xl" />
                  )}
                </div>
              </DialogHeader>

              {isLoading || !reportData ? (
                <DetailedDialogSkeleton />
              ) : (
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
                              {formatObservationDate(reportData.observedAt)}
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
                              {formatObservationTime(reportData.observedAt)}
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
                        {reportData.species?.length || 0}
                      </div>
                    </div>

                    {isSighting ? (
                      <SightingSpeciesCard species={reportData.species} />
                    ) : (
                      <ReportingSpeciesCard
                        species={reportData?.species}
                        causes={reportData?.causes}
                        speciesData={speciesData}
                      />
                    )}
                  </div>

                  {isSighting && (
                    <>
                      <Separator className="my-4" />
                      <SightingDetailsSection reportData={reportData} />
                    </>
                  )}

                  {/* Notes */}
                  {reportData?.notes && (
                    <div className="mb-4">
                      <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        Additional Notes
                      </h3>

                      <Card className="border-none shadow-none">
                        <CardContent className="px-4 py-3">
                          <p className="text-sm text-gray-700">
                            {reportData.notes}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

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

                    {reportData?.images && reportData.images.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {reportData.images.map(
                          (image: string, index: number) => (
                            <div
                              key={index}
                              className="aspect-video bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center hover:shadow-sm transition-shadow overflow-hidden cursor-pointer"
                              role="button"
                            >
                              {image?.includes("https") ? (
                                <img
                                  src={image}
                                  alt={`submission-image-${index + 1}`}
                                  className="w-full h-full object-cover rounded-lg"
                                  onClick={(e) => handleImageClick(e, image)}
                                />
                              ) : (
                                <SignedImage
                                  src={image}
                                  alt={`submission-image-${index + 1}`}
                                  className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform"
                                  width={400}
                                  height={225}
                                  onClick={(e, imageUrl) =>
                                    handleImageClick(e, imageUrl)
                                  }
                                />
                              )}
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <Card className="shadow-none border-none py-0">
                        <CardContent className="p-8 text-center">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-sm">
                            No images available for this{" "}
                            {isSighting ? "sighting" : "report"}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {!hideOtherSubmissions && (
                    <div>
                      <Separator className="my-4" />
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
                          href={`/users/${
                            isSighting ? "sightings" : "reportings"
                          }?id=${reportData.submittedBy.id}`}
                          className="text-blue-600 underline flex items-center text-xs"
                          onClick={() => onClose()}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Other {isSighting ? "Sightings" : "Reportings"}
                        </Link>
                      </div>
                    </div>
                  )}

                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              )}
            </div>

            {isLoading || !reportData ? (
              <MapSkeleton />
            ) : (
              <div className="w-1/2 border-l border-gray-200">
                <div className="h-full">
                  <SubmissionMap
                    longitude={reportData.longitude}
                    latitude={reportData.latitude}
                    locationName={`${
                      reportData.villageOrGhat
                    }, ${formatLocationName(reportData.block)}`}
                    species={reportData.species}
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ActionAlert
        action={action}
        isLoading={isToggleLoading}
        onClose={() => setAction(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
