"use client";

import React, { Fragment, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  CalendarIcon,
  X,
  Download,
} from "lucide-react";
import { getSpeciesDisplayColor } from "@/constants/colorMaps";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { formatPhoneNumber } from "@/lib/strings";

dayjs.extend(utc);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// interface ReportEntry {
//   id: string;
//   longitude: number;
//   latitude: number;
//   altitude: number;
//   provider: string;
//   district: string;
//   block: string;
//   villageOrGhat: string;
//   species: Array<{
//     type: string;
//     adultMale: {
//       stranded: number;
//       injured: number;
//       dead: number;
//     };
//     adultFemale: {
//       stranded: number;
//       injured: number;
//       dead: number;
//     };
//     subAdult: {
//       stranded: number;
//       injured: number;
//       dead: number;
//     };
//   }>;
//   images: string[] | null;
//   observed_at: string;
//   submittedAt: string;
//   type: string;
//   submittedBy: {
//     name: string;
//     phoneNumber: string;
//   };
// }

interface DataTableProps {
  isLoading?: boolean;
  entries: any[];
  onSelect: (id: string) => void;
  showSubmittedBy?: boolean;
  showDateFilter?: boolean;
  showSpecies?: boolean;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    totalRecords: number;
  };
  setPagination?: (params: any) => void;
}

const transformSpeciesName = (rawType: string) => {
  return rawType
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const formatObservationDate = (isoString: string) => {
  return dayjs.utc(isoString).format("MMM DD, YYYY");
};

const formatObservationTime = (isoString: string) => {
  return dayjs.utc(isoString).format("hh:mm A");
};

const formatLocationName = (location: string) => {
  return location.replace(/_/g, " ");
};

// Add Skeleton component
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-gray-200 rounded", className)} />
);

// Loading skeleton rows component
const LoadingSkeletonRows = () => {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <TableRow
          key={`skeleton-${index}`}
          className="border-b border-gray-100"
        >
          {/* District column */}
          <TableCell className="py-3">
            <Skeleton className="h-4 w-24" />
          </TableCell>
          {/* Block column */}
          <TableCell className="py-3">
            <Skeleton className="h-4 w-20" />
          </TableCell>
          {/* Village/Ghat column */}
          <TableCell className="py-3">
            <Skeleton className="h-4 w-32" />
          </TableCell>
          {/* Species column */}
          <TableCell className="py-3">
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </TableCell>
          {/* Submitted At column */}
          <TableCell className="py-3">
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

// CSV Export utility functions
const escapeCSVField = (field: any): string => {
  if (field === null || field === undefined) return "";
  const stringField = String(field);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (
    stringField.includes('"') ||
    stringField.includes(",") ||
    stringField.includes("\n")
  ) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

const convertToCSV = (
  data: any[],
  showSubmittedBy: boolean,
  showSpecies: boolean
): string => {
  if (data.length === 0) return "";

  // Define headers based on what columns are shown
  const headers = [
    "Observed At",
    "Coordinates (Lat & Long)",
    "Revenue Village",
    "Block",
    "District",
    ...(showSpecies ? ["Species"] : []),
    ...(showSubmittedBy ? ["Name", "Phone"] : []),
    "Submitted At",
  ];

  // Convert data to CSV rows
  const csvRows = data.map((entry) => {
    const speciesText = showSpecies
      ? entry.species.map((s: any) => transformSpeciesName(s.type)).join("; ")
      : "";

    const row = [
      `${formatObservationDate(entry.observedAt)}, ${formatObservationTime(
        entry.observedAt
      )}`,
      `${entry.latitude}, ${entry.longitude}`,
      entry.villageOrGhat,
      formatLocationName(entry.block),
      formatLocationName(entry.district),
      ...(showSpecies ? [speciesText] : []),
      ...(showSubmittedBy
        ? [entry.submittedBy.name, entry.submittedBy.phoneNumber]
        : []),
      `${formatObservationDate(entry.submittedAt)}, ${formatObservationTime(
        entry.submittedAt
      )}`,
    ];

    return row.map(escapeCSVField).join(",");
  });

  // Combine headers and rows
  return [headers.join(","), ...csvRows].join("\n");
};

const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export default function SubmissionsTable({
  isLoading,
  entries,
  onSelect,
  pagination = { pageIndex: 0, pageSize: 10, totalRecords: 0 },
  setPagination,
  showDateFilter = true, // Default to true
  showSubmittedBy = true, // Default to true
  showSpecies = true,
}: DataTableProps) {
  const [sortingState, setSortingState] = useState<SortingState>([]);
  const [filterState, setFilterState] = useState<ColumnFiltersState>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  // Get unique districts for filter dropdown
  const districtOptions = useMemo(() => {
    const districts = [...new Set(entries.map((entry) => entry.district))];
    return districts.sort().map((district) => ({
      label: formatLocationName(district),
      value: district,
    }));
  }, [entries]);

  // Custom filter function for date range, districts, and search term
  const filteredData = useMemo(() => {
    let filtered = entries;

    // Apply date filter using dayjs for robust UTC handling
    if (startDate || endDate) {
      filtered = filtered.filter((entry) => {
        const entryDate = dayjs(entry.submittedAt);

        let isAfterStart = true;
        let isBeforeEnd = true;

        if (startDate) {
          // Compare start of day (local) for startDate
          isAfterStart = entryDate.isSameOrAfter(
            dayjs(startDate).startOf("day")
          );
        }
        if (endDate) {
          // Compare end of day (local) for endDate
          isBeforeEnd = entryDate.isSameOrBefore(dayjs(endDate).endOf("day"));
        }
        return isAfterStart && isBeforeEnd;
      });
    }

    // Apply district filter
    if (selectedDistricts.length > 0) {
      filtered = filtered.filter((entry) =>
        selectedDistricts.includes(entry.district)
      );
    }

    // Apply search term filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((entry) => {
        const submittedBy = entry.submittedBy;
        // Normalize phone number for search (remove spaces and special chars)
        const normalizedPhone = submittedBy.phoneNumber.replace(
          /[\s+\-()]/g,
          ""
        );
        const normalizedSearchTerm = searchTerm.replace(/[\s+\-()]/g, "");

        return (
          submittedBy.name.toLowerCase().includes(lowerSearchTerm) ||
          normalizedPhone.includes(normalizedSearchTerm) ||
          entry.district.toLowerCase().includes(lowerSearchTerm) ||
          entry.block.toLowerCase().includes(lowerSearchTerm) ||
          entry.villageOrGhat.toLowerCase().includes(lowerSearchTerm) ||
          entry.species.some((species: any) =>
            transformSpeciesName(species.type)
              .toLowerCase()
              .includes(lowerSearchTerm)
          )
        );
      });
    }

    return filtered;
  }, [entries, startDate, endDate, selectedDistricts, searchTerm]);

  const tableColumns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: "district",
        header: "District",
        cell: ({ row }) => (
          <div className="font-medium text-gray-900">
            {formatLocationName(row.getValue("district"))}
          </div>
        ),
      },
      {
        accessorKey: "block",
        header: "Block",
        cell: ({ row }) => (
          <div className="text-gray-700">
            {formatLocationName(row.getValue("block"))}
          </div>
        ),
      },
      {
        accessorKey: "villageOrGhat",
        header: "Village/Ghat",
        cell: ({ row }) => (
          <div className="text-gray-700 break-words whitespace-normal">
            {row.getValue("villageOrGhat")}
          </div>
        ),
      },
      ...(showSpecies
        ? [
            {
              accessorKey: "species",
              header: "Species",
              cell: ({ row }: any) => {
                const speciesList = row.getValue("species") as Array<{
                  type: string;
                }>;
                return (
                  <div className="flex flex-wrap gap-1 max-w-[100px]">
                    {speciesList.map((specimen, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className={cn(
                          "text-xs font-medium border-none",
                          getSpeciesDisplayColor(specimen.type)
                        )}
                      >
                        {transformSpeciesName(specimen.type)}
                      </Badge>
                    ))}
                  </div>
                );
              },
              enableSorting: false,
              enableGlobalFilter: true,
            },
          ]
        : []),
      ...(showSubmittedBy
        ? [
            {
              accessorKey: "submittedBy",
              header: "Submitted By",
              cell: ({ row }: any) => {
                const submittedBy = row.getValue("submittedBy") as {
                  name: string;
                  phoneNumber: string;
                };
                return (
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {submittedBy.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatPhoneNumber(submittedBy.phoneNumber)}
                    </p>
                  </div>
                );
              },
            },
          ]
        : []),
      {
        accessorKey: "submittedAt",
        header: "Submitted At",
        cell: ({ row }) => (
          <div>
            <p className="text-sm text-gray-600">
              {formatObservationDate(row.getValue("submittedAt"))}
            </p>
            <p className="text-xs text-gray-400">
              {formatObservationTime(row.getValue("submittedAt"))}
            </p>
          </div>
        ),
      },
    ],
    [showSubmittedBy, showSpecies] // Add dependency
  );

  const dataTable = useReactTable({
    data: filteredData,
    columns: tableColumns,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSortingState,
    onColumnFiltersChange: setFilterState,
    onPaginationChange: (updater) => {
      if (typeof updater !== "function") return;
      const newPageInfo = updater(dataTable.getState().pagination);
      setPagination?.(newPageInfo.pageIndex);
    },
    rowCount: pagination.totalRecords,
    state: {
      sorting: sortingState,
      columnFilters: filterState,
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },
    initialState: {
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },
  });

  const currentPage = dataTable.getState().pagination.pageIndex + 1;
  const totalPages = dataTable.getPageCount();
  const hasNextPage = dataTable.getCanNextPage();
  const hasPreviousPage = dataTable.getCanPreviousPage();

  const clearAllFilters = () => {
    setSearchTerm("");
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedDistricts([]);
  };

  const hasActiveFilters =
    searchTerm || startDate || endDate || selectedDistricts.length > 0;

  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      alert("No data to export");
      return;
    }

    const csvContent = convertToCSV(filteredData, showSubmittedBy, showSpecies);
    const timestamp = dayjs().format("YYYY-MM-DD_HH-mm-ss");
    const filename = `submissions_${timestamp}.csv`;

    downloadCSV(csvContent, filename);
  };

  return (
    <>
      <Card className="shadow-none border-0">
        <CardHeader className="pb-0">
          {/* Enhanced Filters Section */}
          <div className="bg-gray-50 rounded-lg p-2 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3">
              {/* Search Filter */}
              <div className="w-[368px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by location, species..."
                    value={searchTerm ?? ""}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 bg-white"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Right side controls */}
              <div className="flex items-center gap-2">
                {/* Export Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={isLoading || filteredData.length === 0}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>

                {/* Date Range Filters */}
                {showDateFilter && (
                  <Fragment>
                    {/* Start Date */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[140px] justify-start text-left font-normal bg-white",
                            !startDate && "text-muted-foreground"
                          )}
                          disabled={isLoading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate
                            ? dayjs(startDate).format("MMM DD")
                            : "Start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                        />
                      </PopoverContent>
                    </Popover>

                    {/* End Date */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[140px] justify-start text-left font-normal bg-white",
                            !endDate && "text-muted-foreground"
                          )}
                          disabled={!startDate || isLoading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate
                            ? dayjs(endDate).format("MMM DD")
                            : "End date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) =>
                            startDate
                              ? dayjs(date).isBefore(dayjs(startDate))
                              : false
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </Fragment>
                )}

                {/* District Multi-Select Filter */}
                <div className="min-w-[280px]">
                  <MultiSelect
                    options={districtOptions}
                    selected={selectedDistricts}
                    onChange={setSelectedDistricts}
                    placeholder="Select districts..."
                    maxDisplay={2}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
                <span className="text-xs font-medium text-gray-500">
                  Active filters:
                </span>
                {searchTerm && (
                  <Badge variant="secondary" className="text-xs">
                    Search: "{searchTerm}"
                  </Badge>
                )}
                {startDate && (
                  <Badge variant="secondary" className="text-xs">
                    From: {dayjs(startDate).format("MMM DD, YYYY")}
                  </Badge>
                )}
                {endDate && (
                  <Badge variant="secondary" className="text-xs">
                    To: {dayjs(endDate).format("MMM DD, YYYY")}
                  </Badge>
                )}
                {selectedDistricts.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Districts: {selectedDistricts.length} selected
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={isLoading}
                >
                  <X className="h-3 w-3" />
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                {dataTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-b border-gray-100"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="font-semibold text-gray-700"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <LoadingSkeletonRows />
                ) : dataTable.getRowModel().rows?.length ? (
                  dataTable.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                      onClick={() => onSelect(row.original.id)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3 max-w-[200px]">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={tableColumns.length}
                      className="h-24 text-center text-gray-500"
                    >
                      No reporting records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              {isLoading ? (
                <Skeleton className="h-4 w-48" />
              ) : (
                <>
                  Showing page {currentPage} of {totalPages} (
                  {filteredData.length} total entries)
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => dataTable.previousPage()}
                disabled={!hasPreviousPage || isLoading}
                className="flex items-center space-x-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
              <div className="flex items-center space-x-1">
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => dataTable.setPageIndex(pageNum - 1)}
                        className="w-8 h-8"
                      >
                        {pageNum}
                      </Button>
                    );
                  })
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dataTable.nextPage()}
                disabled={!hasNextPage || isLoading}
                className="flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
