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
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Globe,
  Pen,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import UpdateModuleDialog from "@/components/modules/training-modules/UpdateModule/UpdateModuleDialog";
import ModuleDetailedDialog from "@/components/modules/training-modules/ModuleDetailedDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Module {
  id: string;
  tier: string;
  title: {
    en: string;
    bn: string;
  };
  description: {
    en: string;
    bn: string;
  };
  url: string;
  thumbnail: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  lastUpdatedAt: string;
}

interface ModulesTableProps {
  isLoading: boolean;
  modules: any[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (pageIndex: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

const ModulesTable: React.FC<ModulesTableProps> = ({
  isLoading,
  modules,
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onPreviousPage,
  onNextPage,
}) => {
  const [sortingState, setSortingState] = useState<SortingState>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [action, setAction] = useState<"edit" | "view" | null>(null);

  const formatTierName = (tier: string) => {
    return tier.replace("TIER_", "Tier ");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTierColor = (tierLevel: string) => {
    const colorMap: Record<string, string> = {
      TIER_1: "bg-green-100 text-green-800 border-green-300",
      TIER_2: "bg-blue-100 text-blue-800 border-blue-300",
      TIER_3: "bg-purple-100 text-purple-800 border-purple-300",
      TIER_4: "bg-orange-100 text-orange-800 border-orange-300",
      TIER_5: "bg-red-100 text-red-800 border-red-300",
    };
    return colorMap[tierLevel] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const tableColumns: ColumnDef<Module>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Module",
        cell: ({ row }) => {
          const module = row.original;
          return (
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  className="h-16 w-24 rounded-md object-cover"
                  src={module.thumbnail}
                  alt={module.title.en}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {module.title.en}
                </p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {module.description.en}
                </p>
                <div className="flex items-center mt-2 text-xs text-gray-400">
                  <Globe className="h-3 w-3 mr-1" />
                  <span className="truncate">{module.title.bn}</span>
                </div>
              </div>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "tier",
        header: "Tier",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "font-medium border-none",
              getTierColor(row.getValue("tier"))
            )}
          >
            {formatTierName(row.getValue("tier"))}
          </Badge>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "font-medium border-none",
              row.getValue("type") === "VR"
                ? "bg-purple-100 text-purple-800"
                : "bg-green-100 text-green-800"
            )}
          >
            {row.getValue("type")}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
          const createdAt = row.getValue("createdAt") as string;
          return (
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(createdAt)}
            </div>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Active Status",
        cell: ({ row }) => {
          const isActive = row.getValue("isActive") as boolean;
          return (
            <div className="flex items-center">
              {isActive ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Active</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <XCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Inactive</span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedModule(row.original);
                  setAction("edit");
                }}
              >
                <Pen className="h-4 w-4 text-blue-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit this module</p>
            </TooltipContent>
          </Tooltip>
        ),
        enableSorting: false,
      },
    ],
    []
  );

  const dataTable = useReactTable({
    data: modules,
    columns: tableColumns,
    onSortingChange: setSortingState,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: sortingState,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Skeleton row for loading state
  const SkeletonRow = () => (
    <TableRow className="border-b border-gray-100">
      <TableCell className="py-4">
        <div className="flex items-start space-x-4">
          <Skeleton className="h-16 w-24 rounded-md" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-48 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <Skeleton className="h-6 w-16 rounded-full" />
      </TableCell>
      <TableCell className="py-4">
        <Skeleton className="h-6 w-12 rounded-full" />
      </TableCell>
      <TableCell className="py-4">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className="py-4">
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell className="py-4">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded" />
          <Skeleton className="h-8 w-16 rounded" />
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <>
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
              // Show 5 skeleton rows while loading
              Array.from({ length: 5 }, (_, idx) => (
                <SkeletonRow key={`skeleton-${idx}`} />
              ))
            ) : dataTable.getRowModel().rows?.length ? (
              dataTable.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedModule(row.original);
                    setAction("view");
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
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
                  No modules found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Showing page {currentPage} of {totalPages} ({modules.length} total
          modules)
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousPage}
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
                  onClick={() => onPageChange(pageNum)}
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
            onClick={onNextPage}
            disabled={!hasNextPage}
            className="flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <UpdateModuleDialog
        isOpen={action === "edit"}
        module={selectedModule as any}
        onClose={() => {
          setSelectedModule(null);
          setAction(null);
        }}
      />

      <ModuleDetailedDialog
        isOpen={action === "view"}
        selectedModule={selectedModule as any}
        onClose={() => {
          setSelectedModule(null);
          setAction(null);
        }}
      />
    </>
  );
};

export default ModulesTable;
