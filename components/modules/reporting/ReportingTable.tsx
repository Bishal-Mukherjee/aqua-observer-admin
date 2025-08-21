"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import dynamic from "next/dynamic";

const DetailedRowDialog = dynamic(
  () => import("@/components/modules/reporting/DetailedRowDialog"),
  { ssr: false }
);

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

interface DataTableProps {
  entries: ReportEntry[];
}

const getSpeciesDisplayColor = (speciesType: string) => {
  const colorMap: Record<string, string> = {
    INDIAN_SKIMMER: "bg-sky-100 text-sky-800 border-sky-300",
    SALTWATER_CROCODILE: "bg-emerald-100 text-emerald-800 border-emerald-300",
    SOFT_SHELLED_TURTLE: "bg-amber-100 text-amber-800 border-amber-300",
    HARD_SHELLED_TURTLE: "bg-orange-100 text-orange-800 border-orange-300",
    MARSH_CROCODILE: "bg-green-100 text-green-800 border-green-300",
    GHARIAL: "bg-purple-100 text-purple-800 border-purple-300",
    IRRAWADDY_DOLPHIN: "bg-blue-100 text-blue-800 border-blue-300",
    SMOOTH_COATED_OTTER: "bg-indigo-100 text-indigo-800 border-indigo-300",
    GANGETIC_DOLPHIN: "bg-cyan-100 text-cyan-800 border-cyan-300",
  };
  return colorMap[speciesType] || "bg-gray-100 text-gray-800 border-gray-300";
};

const transformSpeciesName = (rawType: string) => {
  return rawType
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const formatObservationDate = (isoString: string) => {
  const dateObj = new Date(isoString);
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatObservationTime = (isoString: string) => {
  const dateObj = new Date(isoString);
  return dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatLocationName = (location: string) => {
  return location.replace(/_/g, " ");
};

const formatPhoneNumber = (phoneNumber: string) => {
  // Format phone number as +91 XXXXX XXXXX
  if (phoneNumber.startsWith("+91")) {
    return phoneNumber.replace(/(\+91)(\d{5})(\d{5})/, "$1 $2 $3");
  }
  // If no country code, add +91 and format
  if (phoneNumber.length === 10) {
    return `+91 ${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`;
  }
  return phoneNumber;
};

export default function ReportingTable({ entries }: DataTableProps) {
  const [sortingState, setSortingState] = useState<SortingState>([]);
  const [filterState, setFilterState] = useState<ColumnFiltersState>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  // Dialog state
  const [selectedReportData, setSelectedReportData] =
    useState<ReportEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

    // Apply date filter
    if (startDate) {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.observed_at);
        if (endDate) {
          const endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);
          return entryDate >= startDate && entryDate <= endDateTime;
        }
        return entryDate >= startDate;
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
          entry.species.some((species) =>
            transformSpeciesName(species.type)
              .toLowerCase()
              .includes(lowerSearchTerm)
          )
        );
      });
    }

    return filtered;
  }, [entries, startDate, endDate, selectedDistricts, searchTerm]);

  // Handle row click
  const handleRowClick = (reportData: ReportEntry) => {
    setSelectedReportData(reportData);
    setIsDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedReportData(null);
  };

  const tableColumns: ColumnDef<ReportEntry>[] = useMemo(
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
          <div className="text-gray-700">{row.getValue("villageOrGhat")}</div>
        ),
      },
      {
        accessorKey: "species",
        header: "Species",
        cell: ({ row }) => {
          const speciesList = row.getValue("species") as ReportEntry["species"];
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
      {
        accessorKey: "submittedBy",
        header: "Submitted By",
        cell: ({ row }) => {
          const submittedBy = row.getValue(
            "submittedBy"
          ) as ReportEntry["submittedBy"];
          return (
            <div>
              <p className="text-sm text-gray-900 font-medium">
                {submittedBy.name}
              </p>
              <p className="text-xs text-gray-400">
                {formatPhoneNumber(submittedBy.phoneNumber)}
              </p>
            </div>
          );
        },
        enableSorting: false,
        enableGlobalFilter: true,
      },
      {
        accessorKey: "observed_at",
        header: "Observed At",
        cell: ({ row }) => (
          <div>
            <p className="text-sm text-gray-600">
              {formatObservationDate(row.getValue("observed_at"))}
            </p>
            <p className="text-xs text-gray-400">
              {formatObservationTime(row.getValue("observed_at"))}
            </p>
          </div>
        ),
      },
    ],
    []
  );

  const dataTable = useReactTable({
    data: filteredData, // Use your filtered data
    columns: tableColumns,
    onSortingChange: setSortingState,
    onColumnFiltersChange: setFilterState,
    // Remove onGlobalFilterChange since we're handling search manually
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Remove getFilteredRowModel since we're filtering manually
    state: {
      sorting: sortingState,
      columnFilters: filterState,
      // Remove globalFilter from state
    },
    initialState: {
      pagination: {
        pageSize: 10,
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
                    placeholder="Search by location, species, name, or phone number..."
                    value={searchTerm ?? ""}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 bg-white"
                  />
                </div>
              </div>

              {/* Date Range Filters */}
              <div className="flex items-center gap-2">
                {/* Start Date */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[140px] justify-start text-left font-normal bg-white",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "MMM dd") : "Start date"}
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
                      disabled={!startDate}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MMM dd") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) =>
                        startDate ? date < startDate : false
                      }
                    />
                  </PopoverContent>
                </Popover>

                {/* District Multi-Select Filter */}
                <div className="min-w-[280px]">
                  <MultiSelect
                    options={districtOptions}
                    selected={selectedDistricts}
                    onChange={setSelectedDistricts}
                    placeholder="Select districts..."
                    maxDisplay={2}
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
                    From: {format(startDate, "MMM dd, yyyy")}
                  </Badge>
                )}
                {endDate && (
                  <Badge variant="secondary" className="text-xs">
                    To: {format(endDate, "MMM dd, yyyy")}
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
                {dataTable.getRowModel().rows?.length ? (
                  dataTable.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                      onClick={() => handleRowClick(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3">
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
              Showing page {currentPage} of {totalPages} ({filteredData.length}{" "}
              total entries)
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => dataTable.previousPage()}
                disabled={!hasPreviousPage}
                className="flex items-center space-x-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => dataTable.setPageIndex(pageNum - 1)}
                      className="w-8 h-8"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dataTable.nextPage()}
                disabled={!hasNextPage}
                className="flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Row Dialog */}
      <DetailedRowDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        reportData={selectedReportData}
      />
    </>
  );
}
