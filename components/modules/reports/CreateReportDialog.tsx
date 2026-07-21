import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { isEmpty } from "lodash";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader, FileText, CheckCircle, Download } from "lucide-react";
import {
  useCreateReport,
  useFetchFilteredDocs,
  useGenerateReport,
  useUpdateReport,
} from "@/services/reports";
import { useFileUpload } from "@/hooks/useFileUpload";
import { downloadResource } from "@/services/resources";
import { ReportCriteriaForm } from "@/components/modules/reports/ReportForm/ReportCriteriaForm";
import { ReportEnvironmentalForm } from "@/components/modules/reports/ReportForm/ReportEnvironmentalForm";
import {
  convertReportingsToCSV,
  convertSightingsToCSV,
} from "@/lib/convertToCSV";
import CSVFileSvg from "@/assets/csv-file";
import ReportSvg from "@/assets/report";
import { Progress } from "@/components/ui/progress";
import { ALL_OPTION_VALUE } from "@/components/ui/multi-select";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const FormSegmentIndicator = ({
  currentIndex,
  parts = 2,
}: {
  currentIndex: number;
  parts?: number;
}) => {
  return (
    <div className="w-full flex justify-center items-center space-x-2 mb-4">
      {[...Array(parts)].map((_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full ${
            i === currentIndex ? "bg-blue-600" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

const progressStepsMap: Record<number, string> = {
  5: "Creating report record...",
  15: "Fetching report data...",
  35: "Generating CSV file...",
  60: "Generating analysis report...",
  80: "Uploading analysis report...",
  90: "Updating report record...",
  100: "Complete!",
};

const validationSchema = Yup.object({
  dateRange: Yup.object({
    from: Yup.date(),
    to: Yup.date(),
  }).nullable(),
  districts: Yup.array(),
  species: Yup.array(),
  submissionType: Yup.string(),
  description: Yup.string(),
  waterBody: Yup.array(),
  waterBodyConditions: Yup.array(),
  weatherConditions: Yup.array(),
  threats: Yup.array(),
  fishingGears: Yup.array(),
});

export default function CreateReportDialog() {
  const { uploadReportFile } = useFileUpload();

  const { mutate: fetchFilteredDocs, isPending } = useFetchFilteredDocs();
  const { mutate: createReport, isPending: isCreating } = useCreateReport();
  const { mutate: updateReport, isPending: isUpdating } = useUpdateReport();
  const { mutate: generateReport, isPending: isGenerating } =
    useGenerateReport();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [formSegmentIndex, setFormSegmentIndex] = useState<number>(0);
  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any>(null);
  const [fileLink, setFileLink] = useState<{
    reportFile: string;
    analysisFile: string;
  }>({
    reportFile: "",
    analysisFile: "",
  });

  const withoutAllOption = (values: string[] | undefined) => {
    if (!values || values.length === 0 || values.includes(ALL_OPTION_VALUE)) {
      return undefined;
    }
    return values;
  };

  const formatDateRange = (dateRange: DateRange | undefined) => {
    if (!dateRange) return undefined;
    return {
      from: dateRange.from
        ? dayjs(dateRange.from).format("YYYY-MM-DDT00:00:00[Z]")
        : undefined,
      to: dateRange.to
        ? dayjs(dateRange.to).format("YYYY-MM-DDT23:59:59[Z]")
        : undefined,
    };
  };

  const formik = useFormik({
    initialValues: {
      dateRange: undefined as DateRange | undefined,
      districts: [ALL_OPTION_VALUE] as string[],
      description: "",
      species: [ALL_OPTION_VALUE] as string[],
      submissionType: "reportings",
      waterBody: [ALL_OPTION_VALUE] as string[],
      waterBodyConditions: [ALL_OPTION_VALUE] as string[],
      weatherConditions: [ALL_OPTION_VALUE] as string[],
      threats: [ALL_OPTION_VALUE] as string[],
      fishingGears: [ALL_OPTION_VALUE] as string[],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setGenerationProgress(5);

        createReport(
          {
            submissionType: values.submissionType,
            description: values.description,
            parameters: {
              dateRange: formatDateRange(values.dateRange),
              district: withoutAllOption(values.districts),
              species: withoutAllOption(values.species),
              waterBody: withoutAllOption(values.waterBody),
              waterBodyCondition: withoutAllOption(values.waterBodyConditions),
              weatherCondition: withoutAllOption(values.weatherConditions),
              threats: withoutAllOption(values.threats),
              fishingGears: withoutAllOption(values.fishingGears),
            },
          },
          {
            onSuccess: (reportRecord) => {
              const reportId = reportRecord.data.id;
              setGenerationProgress(15);

              fetchFilteredDocs(
                {
                  dateRange: values.dateRange,
                  districts: withoutAllOption(values.districts),
                  species: withoutAllOption(values.species),
                  submissionType: values.submissionType,
                  description: values.description,
                  waterBody: withoutAllOption(values.waterBody),
                  waterBodyConditions: withoutAllOption(
                    values.waterBodyConditions,
                  ),
                  weatherConditions: withoutAllOption(values.weatherConditions),
                  threats: withoutAllOption(values.threats),
                  fishingGears: withoutAllOption(values.fishingGears),
                },
                {
                  onSuccess: async (data) => {
                    if (isEmpty(data?.result)) {
                      toast.error("No records found for the selected criteria");
                      setGenerationProgress(0);
                      return;
                    }

                    setReportData(data);
                    setGenerationProgress(35);

                    const csvContent =
                      values.submissionType === "reportings"
                        ? convertReportingsToCSV(data.result)
                        : convertSightingsToCSV(data.result);
                    const csvBlob = new Blob([csvContent], {
                      type: "text/csv;charset=utf-8;",
                    });

                    const csvUploadResult = await uploadReportFile(
                      reportId,
                      new File([csvBlob], "data.csv", {
                        type: "text/csv",
                      }),
                      "data.csv",
                    );

                    let csvUrl = "";
                    if (csvUploadResult?.publicURL) {
                      csvUrl = csvUploadResult.publicURL;
                      setFileLink((prev) => ({
                        ...prev,
                        reportFile: csvUrl,
                      }));
                    }

                    setGenerationProgress(60);

                    generateReport(
                      {
                        data: data.result,
                        type: values.submissionType,
                        parameters: {
                          dateRange: formatDateRange(values.dateRange),
                          districts: withoutAllOption(values.districts),
                          species: withoutAllOption(values.species),
                          ...(values.submissionType === "sightings" && {
                            waterBody: withoutAllOption(values.waterBody),
                            waterBodyConditions: withoutAllOption(
                              values.waterBodyConditions,
                            ),
                            weatherConditions: withoutAllOption(
                              values.weatherConditions,
                            ),
                            threats: withoutAllOption(values.threats),
                            fishingGears: withoutAllOption(values.fishingGears),
                          }),
                        },
                      },
                      {
                        onSuccess: async (pdfBlob) => {
                          setGenerationProgress(80);

                          const uploadResult = await uploadReportFile(
                            reportId,
                            new File([pdfBlob], "report.pdf", {
                              type: "application/pdf",
                            }),
                            "report.pdf",
                          );

                          let pdfUrl = "";
                          if (uploadResult?.publicURL) {
                            pdfUrl = uploadResult.publicURL;
                            setFileLink((prev) => ({
                              ...prev,
                              analysisFile: pdfUrl,
                            }));
                          }

                          setGenerationProgress(90);

                          updateReport(
                            {
                              reportId,
                              reportUrl: pdfUrl,
                              csvDataUrl: csvUrl,
                            },
                            {
                              onSuccess: () => {
                                setGenerationProgress(100);

                                setTimeout(() => {
                                  setShowSuccessAlert(true);
                                  setGenerationProgress(0);
                                }, 500);
                              },
                              onError: (err) => {
                                console.error(err);
                                toast.error("Failed to update report record");
                                setGenerationProgress(0);
                              },
                            },
                          );
                        },
                        onError: (err) => {
                          console.error(err);
                          toast.error("Failed to generate PDF report");
                          setGenerationProgress(0);
                        },
                      },
                    );
                  },
                  onError: () => {
                    toast.error("Failed to fetch report data");
                    setGenerationProgress(0);
                  },
                },
              );
            },
            onError: () => {
              toast.error("Failed to create report record");
              setGenerationProgress(0);
            },
          },
        );
      } catch (err) {
        toast.error("An unexpected error occurred");
        setGenerationProgress(0);
      }
    },
  });

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    formik.setFieldValue("dateRange", newDateRange);
  };

  const downloadReports = async (fileType: "pdf" | "csv") => {
    if (fileType === "pdf" && fileLink.analysisFile) {
      await downloadResource(fileLink.analysisFile);
    } else if (fileType === "csv" && fileLink.reportFile) {
      await downloadResource(fileLink.reportFile);
    }
  };

  const resetForm = () => {
    setReportData(null);
    setFileLink({ reportFile: "", analysisFile: "" });
    setShowSuccessAlert(false);
    setGenerationProgress(0);
  };

  const resetFormAndFilters = () => {
    formik.resetForm();
    setReportData(null);
    setFormSegmentIndex(0);
    setFileLink({ reportFile: "", analysisFile: "" });
    setShowSuccessAlert(false);
    setGenerationProgress(0);
  };

  const hasRequiredFields =
    formik.values.dateRange?.from && formik.values.dateRange?.to;

  const isGeneratingReport =
    isPending ||
    isCreating ||
    isUpdating ||
    isGenerating ||
    generationProgress > 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="ml-4 flex items-center cursor-pointer text-xs"
            size="sm"
          >
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        </DialogTrigger>

        <DialogContent
          className="max-h-[95vh] min-w-[40vw] py-0 px-1 gap-0"
          aria-describedby="generate-report-dialog"
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Report
            </DialogTitle>
          </DialogHeader>

          {formSegmentIndex === 0 ? (
            <ReportCriteriaForm
              formik={formik}
              onDateRangeChange={handleDateRangeChange}
              isPending={isPending}
            />
          ) : (
            <ReportEnvironmentalForm formik={formik} />
          )}

          {formik.values.submissionType === "sightings" && (
            <FormSegmentIndicator currentIndex={formSegmentIndex} parts={2} />
          )}

          {isGeneratingReport && (
            <div className="px-6 py-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">
                  {progressStepsMap[generationProgress]}
                </span>
                <span className="text-gray-500">{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          )}

          <DialogFooter className="px-6 py-4 border-t border-gray-100">
            {formSegmentIndex === 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormSegmentIndex(0)}
                disabled={isGeneratingReport}
              >
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  resetFormAndFilters();
                }}
                disabled={isGeneratingReport}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={() => {
                if (
                  formik.values.submissionType === "sightings" &&
                  formSegmentIndex === 0
                ) {
                  setFormSegmentIndex(1);
                } else {
                  formik.submitForm();
                }
              }}
              disabled={!hasRequiredFields || isGeneratingReport}
            >
              {isGeneratingReport ? (
                <>
                  <Loader className="animate-spin h-4 w-4" />
                  Generating...
                </>
              ) : formik.values.submissionType === "sightings" &&
                formSegmentIndex === 0 ? (
                "Next"
              ) : (
                "Generate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showSuccessAlert}
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent
          className="min-w-[36vw] py-0 px-1 gap-0"
          aria-describedby="download-report-dialog"
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Report successfully generated!
            </DialogTitle>
          </DialogHeader>

          <p className="px-6 py-4 text-sm text-gray-700">
            Your report has been successfully generated and contains{" "}
            <span className="font-semibold text-green-700">
              {reportData?.result?.length || 0} records
            </span>
            . Download the report in your preferred format below.
          </p>

          <div className="px-6 pb-6 space-y-3">
            <div
              className="p-3 border border-gray-200 flex items-center gap-3 hover:bg-green-50 hover:border-green-400 transition-all rounded-lg cursor-pointer group"
              onClick={() => downloadReports("csv")}
            >
              <CSVFileSvg className="h-10 w-10 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Download as CSV</p>
                <p className="text-xs text-gray-600">
                  Raw data in spreadsheet format
                </p>
              </div>
              <Download className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>

            <div
              className="p-3 border border-gray-200 flex items-center gap-3 hover:bg-blue-50 hover:border-blue-400 transition-all rounded-lg cursor-pointer group"
              onClick={() => downloadReports("pdf")}
            >
              <ReportSvg className="h-10 w-10 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  Download Analysis Report
                </p>
                <p className="text-xs text-gray-600">
                  Comprehensive report with charts and graphs
                </p>
              </div>
              <Download className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
