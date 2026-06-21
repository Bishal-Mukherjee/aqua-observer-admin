"use client";

import React, { Fragment } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Waves,
  Cloud,
  AlertTriangle,
  Fish,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useFetchReportById } from "@/services/reports";
import { downloadResource } from "@/services/resources";
import { getSpeciesDisplayColor } from "@/constants/colorMaps";
import { useStaticLookup } from "@/store/useStaticLookup";
import { useDistrictStore } from "@/store/useDistricts";

dayjs.extend(utc);

interface ReportDetailedDialogProps {
  reportId: string | null;
  open: boolean;
  onClose: () => void;
}

const formatDate = (isoString: string): string => {
  return dayjs.utc(isoString).local().format("MMM DD, YYYY");
};

const transformName = (rawValue: string): string => {
  return rawValue
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-gray-200 rounded", className)} />
);

const getLabelByValue = (
  array: Array<{ label: string; value: string }>,
  value: string
): string => {
  const found = array.find((item) => item.value === value);
  return found ? found.label : transformName(value);
};

export default function ReportDetailedDialog({
  reportId,
  open,
  onClose,
}: ReportDetailedDialogProps) {
  const { data: reportData, isLoading } = useFetchReportById(reportId || "");
  const {
    waterBodies,
    waterBodyConditions,
    weatherConditions,
    disturbances,
    fishingGears,
  } = useStaticLookup();
  const { districts } = useDistrictStore();

  const report = reportData?.result;

  const downloadFile = async (fileUrl: string) => {
    await downloadResource(fileUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="w-full text-xl font-semibold flex items-center justify-between gap-2 pr-6">
            Report Details
            <div className="bg-gray-100 text-gray-800 rounded-sm p-1 py-0 text-sm uppercase">
              {report?.submissionType}
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-8 py-4 pt-0">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : report ? (
          <div className="space-y-8">
            {report.description && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-700">{report.description}</p>
              </div>
            )}

            {(report.reportUrl || report.csvDataUrl) && (
              <div className="flex items-center justify-between gap-4 mb-6 mt-0">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Available Downloads
                </h3>
                <div className="flex flex-wrap gap-3">
                  {report.reportUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(report.reportUrl!)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="h-4 w-4 text-blue-600" />
                      Download PDF
                    </Button>
                  )}
                  {report.csvDataUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(report.csvDataUrl!)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="h-4 w-4 text-green-600" />
                      Download CSV
                    </Button>
                  )}
                </div>
              </div>
            )}

            {report.parameters && (
              <Fragment>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Applied Filters
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.parameters.dateRange && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                          <Calendar className="h-4 w-4" />
                          Date Range
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-700">
                            {formatDate(report.parameters.dateRange.from)} -{" "}
                            {formatDate(report.parameters.dateRange.to)}
                          </p>
                        </div>
                      </div>
                    )}

                    {report.parameters.district &&
                      report.parameters.district.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                            <MapPin className="h-4 w-4" />
                            Districts
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {report.parameters.district.map(
                              (dist: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {getLabelByValue(districts, dist)}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {report.parameters.species &&
                      report.parameters.species.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                            <Fish className="h-4 w-4" />
                            Species
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {report.parameters.species.map(
                              (speciesValue: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className={cn(
                                    "text-xs font-medium border-none",
                                    getSpeciesDisplayColor(speciesValue)
                                  )}
                                >
                                  {speciesValue?.split("_").join(" ")}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {report.parameters.waterBody &&
                      report.parameters.waterBody.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                            <Waves className="h-4 w-4" />
                            Water Body
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {report.parameters.waterBody.map(
                              (wb: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {getLabelByValue(waterBodies, wb)}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Weather Condition */}
                    {report.parameters.weatherCondition &&
                      report.parameters.weatherCondition.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                            <Cloud className="h-4 w-4" />
                            Weather Condition
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {report.parameters.weatherCondition.map(
                              (weather: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {getLabelByValue(weatherConditions, weather)}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Water Body Condition */}
                    {report.parameters.waterBodyCondition &&
                      report.parameters.waterBodyCondition.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                            <Waves className="h-4 w-4" />
                            Water Body Condition
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {report.parameters.waterBodyCondition.map(
                              (condition: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {getLabelByValue(
                                    waterBodyConditions,
                                    condition
                                  )}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Threats */}
                    {report.parameters.threats &&
                      report.parameters.threats.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                            <AlertTriangle className="h-4 w-4" />
                            Threats
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {report.parameters.threats.map(
                              (threat: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  {getLabelByValue(disturbances, threat)}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Fishing Gears */}
                    {report.parameters.fishingGears &&
                      report.parameters.fishingGears.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                            <Fish className="h-4 w-4" />
                            Fishing Gears
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {report.parameters.fishingGears.map(
                              (gear: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {getLabelByValue(fishingGears, gear)}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="text-sm text-gray-500">
                    <span>Created on {formatDate(report.createdAt)}</span>
                  </div>
                </div>
              </Fragment>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No report data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
