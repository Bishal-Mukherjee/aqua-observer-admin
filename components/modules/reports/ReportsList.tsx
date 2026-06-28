"use client";

import React, { Fragment, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  FileUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { downloadResource } from "@/services/resources";

dayjs.extend(utc);

interface Report {
  id: string;
  submissionType: string;
  description: string | null;
  reportUrl: string | null;
  csvDataUrl: string | null;
  createdBy: string | null;
  createdAt: string;
}

interface ReportsListProps {
  isLoading?: boolean;
  reports: Report[];
  onSelect?: (id: string) => void;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    totalRecords: number;
  };
  setPagination?: (pageIndex: number) => void;
}

const getSubmissionTypeColor = (type: string): string => {
  const colorMap: { [key: string]: string } = {
    sightings: "bg-blue-100 text-blue-800",
    reportings: "bg-purple-100 text-purple-800",
  };
  return colorMap[type] || "bg-gray-100 text-gray-800";
};

const formatSubmissionType = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const formatDate = (isoString: string): string => {
  return dayjs.utc(isoString).local().format("MMM DD, YYYY");
};

const formatTime = (isoString: string): string => {
  return dayjs.utc(isoString).local().format("hh:mm A");
};

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-gray-200 rounded", className)} />
);

const LoadingSkeletonRows = () => {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow
          key={`skeleton-${index}`}
          className="border-b border-gray-100"
        >
          <TableCell className="py-3">
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell className="py-3">
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell className="py-3">
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell className="py-3">
            <div className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </TableCell>
          <TableCell className="py-3">
            <Skeleton className="h-8 w-16" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default function ReportsList({
  isLoading,
  reports,
  onSelect,
  pagination = { pageIndex: 0, pageSize: 10, totalRecords: 0 },
  setPagination,
}: ReportsListProps) {
  const [sortingState, setSortingState] = useState<SortingState>([]);

  const downloadReports = async (_fileType: "pdf" | "csv", fileUrl: string) => {
    if (!fileUrl) return;
    await downloadResource(fileUrl);
  };

  const tableColumns: ColumnDef<Report>[] = useMemo(
    () => [
      {
        accessorKey: "submissionType",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("submissionType") as string;
          return (
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium border-none",
                getSubmissionTypeColor(type),
              )}
            >
              {formatSubmissionType(type)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          const description = row.getValue("description") as string | null;
          return (
            <div className="text-sm text-gray-700">
              {description ? (
                <span>{description}</span>
              ) : (
                <span className="text-gray-400 italic">No description</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "createdBy",
        header: "Created By",
        cell: ({ row }) => {
          const createdBy = row.getValue("createdBy") as string | null;
          const createdAt = row.original.createdAt as string;
          return (
            <div className="text-sm text-gray-700">
              {createdBy || (
                <span className="text-gray-400 italic">Unknown</span>
              )}
              <p className="text-gray-600 text-xs">
                {formatDate(createdAt)} &#x2022; {formatTime(createdAt)}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "id",
        header: "Downloads",
        cell: ({ row }) => {
          const report = row.original;
          return (
            <div className="flex items-center gap-4 pl-2">
              {report.reportUrl && (
                <Tooltip>
                  <TooltipTrigger
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadReports("pdf", report.reportUrl!);
                    }}
                    className="cursor-pointer"
                  >
                    <FileText className="h-4 w-4 text-blue-600" />
                  </TooltipTrigger>
                  <TooltipContent>Download PDF Report</TooltipContent>
                </Tooltip>
              )}
              {report.csvDataUrl && (
                <Tooltip>
                  <TooltipTrigger
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadReports("csv", report.csvDataUrl!);
                    }}
                    className="cursor-pointer"
                  >
                    <Download className="h-4 w-4 text-green-600" />
                  </TooltipTrigger>
                  <TooltipContent>Download CSV Data</TooltipContent>
                </Tooltip>
              )}
              {!report.reportUrl && !report.csvDataUrl && (
                <span className="text-xs text-gray-400">No files</span>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [],
  );

  const dataTable = useReactTable({
    data: reports,
    columns: tableColumns,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSortingState,
    rowCount: pagination.totalRecords,
    state: {
      sorting: sortingState,
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

  return (
    <Fragment>
      <Card className="shadow-none border-0">
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
                              header.getContext(),
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
                      onClick={() => onSelect?.(row.original.id)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
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
                      No reports found.
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
                  Showing page {currentPage} of {totalPages} ({reports.length}{" "}
                  total reports)
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
    </Fragment>
  );
}
