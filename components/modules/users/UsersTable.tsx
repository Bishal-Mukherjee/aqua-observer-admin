"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import dayjs from "dayjs";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Activity,
  UserX,
  UserCheck,
  Siren,
  Binoculars,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import UserDetailedDialog from "@/components/modules/users/UserDetailedDialog";
import UserEditDialog from "@/components/modules/users/UserEditDialog";
import UserStatusDialog from "@/components/modules/users/UserStatusDialog";

interface UserData {
  id: string;
  name: string;
  phoneNumber: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  role: "SIGHTER" | "SUB_ADMIN";
  tier: string;
  status: "ACTIVE" | "SUSPENDED" | "ONBOARDED";
  age: number;
  email: string | null;
  occupation: string | null;
  createdAt: string;
  lastActiveAt: string;
  reportingsCount: string;
  sightingsCount: string;
}

interface UsersTableProps {
  isLoading: boolean;
  users: UserData[];
  pagination?: {
    pageIndex: number;
    pageSize: number;
    totalRecords: number;
  };
  setPagination?: (params: any) => void;
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800 border-green-300",
    SUSPENDED: "bg-red-100 text-red-800 border-red-300",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-300";
};

const getRoleColor = (role: string) => {
  const colorMap: Record<string, string> = {
    SUB_ADMIN: "bg-purple-100 text-purple-800 border-purple-300",
    SIGHTER: "bg-green-100 text-green-800 border-green-300",
  };
  return colorMap[role] || "bg-gray-100 text-gray-800 border-gray-300";
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

const getTimeAgo = (isoString: string | null) => {
  if (!isoString) return "Never active";

  const now = dayjs();
  const date = dayjs(isoString);
  const diffInHours = now.diff(date, "hour");

  if (diffInHours < 24) return "Active Today";
  const diffInDays = now.diff(date, "day");
  return `${diffInDays}d ago`;
};

export default function UsersTable({
  isLoading,
  users,
  pagination = { pageIndex: 0, pageSize: 10, totalRecords: 0 },
  setPagination,
}: UsersTableProps) {
  const [sortingState, setSortingState] = useState<SortingState>([]);
  const [action, setAction] = useState<
    "view" | "edit" | "suspend" | "activate" | null
  >(null);
  const [selectedUserData, setSelectedUserData] = useState<UserData | null>(
    null,
  );

  // Handle row click
  const handleRowClick = (userData: UserData) => {
    setAction("view");
    setSelectedUserData(userData);
  };

  // Skeleton row component
  const SkeletonRow = () => (
    <TableRow className="border-b border-gray-100">
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div>
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      </TableCell>
      <TableCell className="py-4">
        <Skeleton className="h-6 w-16 rounded-full" />
      </TableCell>
      <TableCell className="py-4">
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>
      <TableCell className="py-4">
        <Skeleton className="h-6 w-16 rounded-full" />
      </TableCell>
      <TableCell className="py-4">
        <Skeleton className="h-4 w-8" />
      </TableCell>
      <TableCell className="py-4">
        <div>
          <Skeleton className="h-3 w-12 mb-1" />
          <Skeleton className="h-3 w-12" />
        </div>
      </TableCell>
      <TableCell className="py-4">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className="py-4">
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell className="py-4">
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </TableCell>
    </TableRow>
  );

  const tableColumns: ColumnDef<UserData>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Profile",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold text-sm">
              {row.original?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{row.original?.name}</p>
              <p className="text-xs text-gray-500">
                {row.original?.email || "-"}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "contact",
        header: "Contact",
        cell: ({ row }) => (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Phone className="h-3 w-3 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                {row.original?.phoneNumber}
              </span>
            </div>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "font-medium border-none",
              getStatusColor(row.getValue("status")),
            )}
          >
            {row.getValue("status") || "-"}
          </Badge>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "font-medium border-none",
              getRoleColor(row.getValue("role")),
            )}
          >
            {row.getValue("role") || "-"}
          </Badge>
        ),
      },
      {
        accessorKey: "tier",
        header: "Tier",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "font-medium border-none",
              getTierColor(row.getValue("tier")),
            )}
          >
            {formatTierDisplay(row.getValue("tier") || "-")}
          </Badge>
        ),
      },
      {
        accessorKey: "age",
        header: "Age",
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">
            {row.getValue("age") || "-"}
          </span>
        ),
      },
      {
        accessorKey: "activity",
        header: "Activity",
        cell: ({ row }) => (
          <div className="space-y-1 ml-1 flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Siren className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-900">
                {row.original?.reportingsCount || "-"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Binoculars className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-900">
                {row.original?.sightingsCount || "-"}
              </span>
            </div>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) => {
          const createdAt = row.getValue("createdAt") as string;
          return (
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {formatDate(createdAt)}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "lastActiveAt",
        header: "Last Active",
        cell: ({ row }) => {
          const lastActiveAt = row.getValue("lastActiveAt") as string;
          return (
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-gray-400" />
              <span className="text-sm text-gray-600">
                {getTimeAgo(lastActiveAt)}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          if (row.original.status === "ONBOARDED")
            return <span className="text-gray-400">-</span>;
          return (
            <div className="flex items-center ml-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAction("edit");
                      setSelectedUserData(row.original);
                    }}
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit user</p>
                </TooltipContent>
              </Tooltip>

              {row.original.status === "ACTIVE" ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAction("suspend");
                        setSelectedUserData(row.original);
                      }}
                    >
                      <UserX className="h-4 w-4 text-red-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Block user</p>
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
                        setAction("activate");
                        setSelectedUserData(row.original);
                      }}
                    >
                      <UserCheck className="h-4 w-4 text-green-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Activate user</p>
                  </TooltipContent>
                </Tooltip>
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
    data: users,
    columns: tableColumns,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSortingState,
    onPaginationChange: (updater) => {
      if (typeof updater !== "function") return;
      const newPageInfo = updater(dataTable.getState().pagination);
      setPagination?.(newPageInfo.pageIndex);
    },
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
                          header.getContext(),
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
                  No users found.
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
              Showing page {currentPage} of {totalPages} ({users.length} total
              entries)
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
                    variant={currentPage === pageNum ? "default" : "outline"}
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

      {/* User Detail Dialog - You'll need to create this component */}
      {!!selectedUserData?.id && action === "view" && (
        <UserDetailedDialog
          isOpen={!!selectedUserData?.id && action === "view"}
          onClose={() => {
            setAction(null);
            setSelectedUserData(null);
          }}
          userData={selectedUserData}
        />
      )}

      {!!selectedUserData?.id && action === "edit" && (
        <UserEditDialog
          isOpen={!!selectedUserData?.id && action === "edit"}
          onClose={() => {
            setAction(null);
            setSelectedUserData(null);
          }}
          userData={selectedUserData as any}
        />
      )}

      {/* User Status Dialog - You'll need to create this component */}
      {selectedUserData && (action === "suspend" || action === "activate") && (
        <UserStatusDialog
          open={
            !!(
              selectedUserData &&
              (action === "suspend" || action === "activate")
            )
          }
          user={selectedUserData}
          newStatus={action === "suspend" ? "SUSPENDED" : "ACTIVE"}
          onClose={() => {
            setAction(null);
            setSelectedUserData(null);
          }}
        />
      )}
    </>
  );
}
