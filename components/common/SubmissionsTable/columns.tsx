import dayjs from "dayjs";
import { type ColumnDef } from "@tanstack/react-table";
import { getSpeciesDisplayColor } from "@/constants/colorMaps";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const transformSpeciesName = (rawType: string) => {
  return rawType
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const formatObservationDate = (isoString: string) => {
  return dayjs(isoString).format("YYYY-MM-DD");
};

const formatObservationTime = (isoString: string) => {
  return dayjs(isoString).format("hh:mm A");
};

const formatLocationName = (location: string) => {
  return location.replace(/_/g, " ");
};

export const getReportingColumns = (): ColumnDef<any>[] => [
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
      const speciesList = row.getValue("species") as Array<{ type: string }>;
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
];
