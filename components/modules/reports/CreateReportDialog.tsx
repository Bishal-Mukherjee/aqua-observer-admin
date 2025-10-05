import React, { useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import { Loader, FileText, CheckCircle, Download } from "lucide-react";
import { useSpecies } from "@/store/useSpecies";
import { useDistrictStore } from "@/store/useDistricts";
import { useCreateReport } from "@/services/reports";
import { useFileUpload } from "@/hooks/useFileUpload";
import { set } from "lodash";

const SUBMISSION_TYPES = [
  { value: "reportings", label: "Reportings" },
  { value: "sightings", label: "Sightings" },
];

const validationSchema = Yup.object({
  dateRange: Yup.object({
    from: Yup.date(),
    to: Yup.date(),
  }).nullable(),
  districts: Yup.array(),
  species: Yup.array(),
  submissionType: Yup.string(),
  description: Yup.string(),
});

const convertToCSV = (data: any[]) => {
  if (!data || data.length === 0) return "";

  // Define CSV headers
  const headers = [
    "ID",
    "Latitude",
    "Longitude",
    "District",
    "Block",
    "Village/Ghat",
    "Submitted At",
    "Species",
    "Causes",
    "Submitted By Name",
    "Submitted By Phone",
  ];

  // Convert data to CSV rows
  const rows = data.map((item) => {
    const species =
      item.species
        ?.map(
          (s: any) =>
            `${s.type} (A:${s.adult.stranded + s.adult.injured + s.adult.dead})`
        )
        .join("; ") || "";
    const causes =
      item.causes
        ?.map(
          (c: any) =>
            `${c.species}: ${c.cause?.join(", ")} ${c.otherCause || ""}`
        )
        .join("; ") || "";

    return [
      item.id,
      item.latitude,
      item.longitude,
      item.district,
      item.block,
      item.villageOrGhat,
      new Date(item.submittedAt).toLocaleDateString(),
      species,
      causes,
      item.submittedBy?.name || "",
      item.submittedBy?.phoneNumber || "",
    ];
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(","))
    .join("\n");

  return csvContent;
};

export default function CreateReportDialog() {
  const { uploadFile } = useFileUpload();
  const { mutate: createReport, isPending } = useCreateReport();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any>(null);
  const [result, setResult] = useState<any>(null);

  const { species } = useSpecies();
  const { districts } = useDistrictStore();

  const speciesOptions = useMemo(() => {
    return species.map((s) => ({ label: s.label.en, value: s.value }));
  }, [species]);

  const formik = useFormik({
    initialValues: {
      dateRange: undefined as DateRange | undefined,
      districts: [] as string[],
      species: [] as string[],
      submissionType: "reportings",
      description: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        createReport(
          {
            dateRange,
            districts: values.districts,
            species: values.species,
            submissionType: values.submissionType,
            description: values.description,
          },
          {
            onSuccess: async (data) => {
              if (data?.result.length === 0) {
                toast.error("No records found for the selected criteria");
                return;
              }

              const csvContent = convertToCSV(data.result);
              const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
              });

              const uploadResult = await uploadFile(
                "dashboard-bucket",
                "reports",
                new File(
                  [blob],
                  `marine_report_${new Date().toISOString().split("T")[0]}.csv`,
                  { type: "text/csv" }
                )
              );

              setResult(uploadResult);
              setReportData(data);
              setIsOpen(false);
              setShowSuccessAlert(true);
              toast.success("Report generated successfully!");
            },
            onError: () => {
              toast.error("Failed to generate report");
            },
            onSettled: () => {
              formik.resetForm();
              setDateRange(undefined);
              setIsOpen(false);
            },
          }
        );
      } catch (err) {
        toast.error("An unexpected error occurred");
      }
    },
  });

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    formik.setFieldValue("dateRange", newDateRange);
  };

  const handleDownloadReport = () => {
    // Convert data to CSV format
    // if (reportData?.result && reportData.result.length > 0) {
    //   const csvContent = convertToCSV(reportData.result);
    //   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    //   const url = URL.createObjectURL(blob);
    //   const a = document.createElement("a");
    //   a.href = url;
    //   a.download = `marine_report_${
    //     new Date().toISOString().split("T")[0]
    //   }.csv`;
    //   document.body.appendChild(a);
    //   a.click();
    //   document.body.removeChild(a);
    //   URL.revokeObjectURL(url);
    // }

    // setShowSuccessAlert(false);
    // resetForm();

    console.log("result", result);
    if (result?.publicURL) {
      window.open(result.publicURL, "_blank");
    }
  };

  const resetForm = () => {
    formik.resetForm();
    setDateRange(undefined);
    setReportData(null);
  };

  // Since all fields are optional, form is always valid
  const hasAnyValue =
    (dateRange?.from && dateRange?.to) ||
    formik.values.districts.length > 0 ||
    formik.values.species.length > 0 ||
    formik.values.submissionType ||
    formik.values.description.trim();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="ml-4 flex items-center cursor-pointer" size="sm">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        </DialogTrigger>

        <DialogContent
          className="max-h-[90vh] min-w-[40vw] py-0 px-1 gap-0"
          aria-describedby="generate-report-dialog"
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Report
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-4 flex-1 overflow-y-auto">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-700">Date Range</Label>
                <DateRangePicker
                  date={dateRange}
                  onDateChange={handleDateRangeChange}
                  placeholder="Select date range"
                  numberOfMonths={2}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">Districts</Label>
                <MultiSelect
                  options={districts}
                  selected={formik.values.districts}
                  onChange={(values) =>
                    formik.setFieldValue("districts", values)
                  }
                  placeholder="Select districts..."
                  maxDisplay={3}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">Species</Label>
                <MultiSelect
                  options={speciesOptions}
                  selected={formik.values.species}
                  onChange={(values) => formik.setFieldValue("species", values)}
                  placeholder="Select species..."
                  maxDisplay={3}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">Submission Type</Label>
                <Select
                  value={formik.values.submissionType}
                  onValueChange={(value) =>
                    formik.setFieldValue("submissionType", value)
                  }
                  disabled={isPending}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select submission type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBMISSION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the purpose of this report, e.g., 'Monthly marine wildlife monitoring report for conservation analysis' or 'Research data compilation for species migration patterns study'"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={3}
                  className="resize-none"
                  disabled={isPending}
                />
              </div>
            </form>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={formik.submitForm}
              disabled={isPending || !hasAnyValue}
            >
              {isPending ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Generating...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showSuccessAlert} onOpenChange={setShowSuccessAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Report Generated Successfully!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your report has been generated with{" "}
              <span className="font-semibold text-green-700">
                {reportData?.result?.length || 0} records
              </span>
              . Would you like to download the report as a CSV file?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowSuccessAlert(false);
                resetForm();
              }}
            >
              Close
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDownloadReport}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
