"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Users,
  BookOpen,
  Pen,
  BadgeX,
  CheckCircle, // Add this import
} from "lucide-react";
import { cn } from "@/lib/utils";
import TierStatusDialog from "@/components/modules/tiers/TierStatusDialog"; // Updated import name
import EditTierDialog from "@/components/modules/tiers/EditTierDialog";
import CreateTierDialog from "@/components/modules/tiers/CreateTier/CreateTierDialog";
import { useUpdateTier } from "@/services/tiers";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
const TierDetailDialog = dynamic(
  () => import("@/components/modules/tiers/TierDetailDialog"),
  { ssr: false }
);

interface TierData {
  id: string;
  tier: string;
  title: {
    en: string;
    bn?: string;
  };
  description: {
    en: string;
    bn?: string;
  };
  modules: string;
  users: string;
  createdAt: string;
  lastUpdatedAt: string;
  isActive: boolean; // Add this line
}

interface TiersTableProps {
  tiers: TierData[];
  isLoading?: boolean;
}

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

const formatTierDisplay = (tier: string) => {
  return tier.replace("TIER_", "Tier ");
};

const formatDate = (isoString: string) => {
  const dateObj = new Date(isoString);
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function TiersTable({ tiers, isLoading }: TiersTableProps) {
  const queryClient = useQueryClient();
  const { mutate: updateTier } = useUpdateTier();

  const [sortingState, setSortingState] = useState<SortingState>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog state
  const [action, setAction] = useState<
    "view" | "edit" | "deactivate" | "activate" | null
  >(null);
  const [selectedTierData, setSelectedTierData] = useState<TierData | null>(
    null
  );

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return tiers;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return tiers.filter(
      (tier) =>
        tier.title.en.toLowerCase().includes(lowerSearchTerm) ||
        tier.description.en.toLowerCase().includes(lowerSearchTerm) ||
        tier.tier.toLowerCase().includes(lowerSearchTerm)
    );
  }, [tiers, searchTerm]);

  // Handle row click
  const handleRowClick = (tierData: TierData) => {
    setAction("view");
    setSelectedTierData(tierData);
  };

  const handleDeactivateClick = (tierData: TierData) => {
    setSelectedTierData(tierData);
    setAction("deactivate");
  };

  const handleActivateClick = (tierData: TierData) => {
    setSelectedTierData(tierData);
    setAction("activate");
  };

  const handleConfirmStatusChange = () => {
    const requestData = {
      tier: {
        id: selectedTierData?.id,
        title: selectedTierData?.title,
        description: selectedTierData?.description,
        isActive: !selectedTierData?.isActive,
      },
    };

    updateTier(requestData, {
      onSuccess: () => {
        toast.success("Tier status updated successfully");
      },
      onError: (error) => {
        toast.error("Failed to update tier status");
      },
      onSettled: () => {
        setAction(null);
        setSelectedTierData(null);
        queryClient.invalidateQueries({ queryKey: ["tiers"] });
      },
    });
  };

  // Skeleton row component
  const SkeletonRow = () => (
    <TableRow className="border-b border-gray-100">
      <TableCell className="py-4">
        <Skeleton className="h-6 w-16 rounded-full" />
      </TableCell>
      <TableCell className="py-4">
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell className="py-4">
        <div className="max-w-md">
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-8" />
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-8" />
        </div>
      </TableCell>
      <TableCell className="py-4">
        <Skeleton className="h-4 w-20" />
      </TableCell>
    </TableRow>
  );

  const tableColumns: ColumnDef<TierData>[] = useMemo(
    () => [
      {
        accessorKey: "tier",
        header: "Tier Level",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "font-medium border-none",
                getTierColor(row.getValue("tier"))
              )}
            >
              {formatTierDisplay(row.getValue("tier"))}
            </Badge>
            {!row.original.isActive && (
              <Badge variant="secondary" className="text-xs text-gray-500">
                Inactive
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
          const title = row.getValue("title") as TierData["title"];
          return (
            <p
              className={cn(
                "font-medium",
                !row.original.isActive ? "text-gray-500" : "text-gray-900"
              )}
            >
              {title.en}
            </p>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          const description = row.getValue(
            "description"
          ) as TierData["description"];
          return (
            <div className="max-w-md">
              <p
                className={cn(
                  "text-sm whitespace-normal break-words",
                  !row.original.isActive ? "text-gray-400" : "text-gray-700"
                )}
              >
                {description.en}
              </p>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "modules",
        header: "Modules",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <BookOpen
              className={cn(
                "h-4 w-4",
                !row.original.isActive ? "text-gray-300" : "text-gray-400"
              )}
            />
            <span
              className={cn(
                "font-medium",
                !row.original.isActive ? "text-gray-400" : "text-gray-900"
              )}
            >
              {row.getValue("modules")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "users",
        header: "Users",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Users
              className={cn(
                "h-4 w-4",
                !row.original.isActive ? "text-gray-300" : "text-gray-400"
              )}
            />
            <span
              className={cn(
                "font-medium",
                !row.original.isActive ? "text-gray-400" : "text-gray-900"
              )}
            >
              {row.getValue("users")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
          const createdAt = row.getValue("createdAt") as string;
          return (
            <p
              className={cn(
                "font-medium",
                !row.original.isActive ? "text-gray-400" : "text-gray-500"
              )}
            >
              {formatDate(createdAt)}
            </p>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAction("edit");
                    setSelectedTierData(row.original);
                  }}
                  disabled={!row.original.isActive}
                >
                  <Pen
                    className={cn(
                      "h-4 w-4",
                      !row.original.isActive ? "text-gray-300" : "text-blue-600"
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit this tier</p>
              </TooltipContent>
            </Tooltip>

            {row.original.isActive ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeactivateClick(row.original);
                    }}
                    disabled={
                      row.original.users !== "0" || row.original.modules !== "0"
                    }
                  >
                    <BadgeX className="h-4 w-4 text-red-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Deactivate this tier</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActivateClick(row.original);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Activate this tier</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        ),
        enableSorting: false,
      },
    ],
    []
  );

  const dataTable = useReactTable({
    data: filteredData,
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

  const currentPage = dataTable.getState().pagination.pageIndex + 1;
  const totalPages = dataTable.getPageCount();
  const hasNextPage = dataTable.getCanNextPage();
  const hasPreviousPage = dataTable.getCanPreviousPage();

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <>
      <Card className="shadow-none border-0">
        <CardHeader className="pb-0">
          {/* Filters Section */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              {/* Search Filter */}
              <div className="w-[400px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by tier name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 bg-white"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Stats Display */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {isLoading ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span>Total Tiers:</span>
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Total Users:</span>
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </>
                ) : (
                  <>
                    <span>
                      Total Tiers:{" "}
                      <span className="font-medium">{tiers.length}</span>
                    </span>
                    <span>
                      Total Users:{" "}
                      <span className="font-medium">
                        {tiers.reduce(
                          (sum, tier) => sum + parseInt(tier.users),
                          0
                        )}
                      </span>
                    </span>
                  </>
                )}

                <CreateTierDialog />
              </div>
            </div>

            {/* Active Search Display */}
            {searchTerm && !isLoading && (
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                <span className="text-xs font-medium text-gray-500">
                  Active search:
                </span>
                <Badge variant="secondary" className="text-xs">
                  "{searchTerm}"
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-3 w-3" />
                  Clear
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
                  // Show skeleton rows while loading
                  Array.from({ length: 5 }, (_, index) => (
                    <SkeletonRow key={`skeleton-${index}`} />
                  ))
                ) : dataTable.getRowModel().rows?.length ? (
                  dataTable.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                      onClick={() => handleRowClick(row.original)}
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
                      No tiers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && !isLoading && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing page {currentPage} of {totalPages} (
                {filteredData.length} total tiers)
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
          )}
        </CardContent>
      </Card>

      {/* Tier Detail Dialog */}
      {!!selectedTierData?.id && action === "view" && (
        <TierDetailDialog
          isOpen={!!selectedTierData?.id && action === "view"}
          onClose={() => {
            setAction(null);
            setSelectedTierData(null);
          }}
          tierData={selectedTierData}
        />
      )}

      {/* Edit Tier Dialog */}
      {!!selectedTierData?.id && action === "edit" && (
        <EditTierDialog
          isOpen={!!selectedTierData?.id && action === "edit"}
          onClose={() => {
            setAction(null);
            setSelectedTierData(null);
          }}
          tierData={selectedTierData}
        />
      )}

      {/* Tier Status Dialog (handles both activate and deactivate) */}
      <TierStatusDialog
        isOpen={
          !!(
            selectedTierData?.id &&
            (action === "deactivate" || action === "activate")
          )
        }
        onClose={() => {
          setAction(null);
          setSelectedTierData(null);
        }}
        onConfirm={handleConfirmStatusChange}
        action={action as "activate" | "deactivate"}
        tierData={selectedTierData}
      />
    </>
  );
}
