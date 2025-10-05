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
import { getSpeciesDisplayColor } from "@/constants/colorMaps";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { formatPhoneNumber } from "@/lib/strings";

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
  showSubmittedBy?: boolean; // Add this prop
}

const transformSpeciesName = (rawType: string) => {
  return rawType
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

// Replace formatObservationDate and formatObservationTime functions
const formatObservationDate = (isoString: string) => {
  return dayjs(isoString).format("MMM DD, YYYY");
};

const formatObservationTime = (isoString: string) => {
  return dayjs(isoString).format("hh:mm A");
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

export default function SubmissionsTable({
  isLoading,
  entries,
  onSelect,
  showSubmittedBy = true, // Default to true
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
      {
        accessorKey: "species",
        header: "Species",
        cell: ({ row }) => {
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
    [showSubmittedBy] // Add dependency
  );

  const dataTable = useReactTable({
    data: filteredData,
    columns: tableColumns,
    onSortingChange: setSortingState,
    onColumnFiltersChange: setFilterState,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: sortingState,
      columnFilters: filterState,
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
                    placeholder="Search by location, species..."
                    value={searchTerm ?? ""}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 bg-white"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Date Range Filters */}
              <div className="flex items-center gap-2">
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
