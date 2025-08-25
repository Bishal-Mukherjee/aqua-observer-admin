"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const sightingsData = [
  { region: "Murshidabad", sightings: 342, color: "#93c5fd" },
  { region: "Hooghly", sightings: 198, color: "#60a5fa" },
  { region: "Howrah", sightings: 156, color: "#3b82f6" },
  { region: "South 24 Parganas", sightings: 89, color: "#2563eb" },
  { region: "Nadia", sightings: 72, color: "#1e40af" },
];

const reportingsData = [
  { region: "Murshidabad", reportings: 425, color: "#93c5fd" },
  { region: "Hooghly", reportings: 276, color: "#60a5fa" },
  { region: "Howrah", reportings: 234, color: "#3b82f6" },
  { region: "South 24 Parganas", reportings: 145, color: "#2563eb" },
  { region: "Nadia", reportings: 98, color: "#1e40af" },
];

export default function DistributionOverviewDonut() {
  const [selectedType, setSelectedType] = useState<"sightings" | "reportings">(
    "reportings"
  );

  const currentData =
    selectedType === "sightings" ? sightingsData : reportingsData;
  const dataKey = selectedType === "sightings" ? "sightings" : "reportings";

  const total = currentData.reduce((sum, region: any) => {
    return sum + (region[dataKey] || 0);
  }, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-900">
            {payload[0].payload.region}
          </p>
          <p className="text-sm text-gray-600">
            {payload[0].value.toLocaleString()} {selectedType}
          </p>
          <p className="text-xs text-gray-500">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = () => {
    return (
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-gray-900"
      >
        <tspan
          x="50%"
          dy="-0.5em"
          fontSize="14"
          fontWeight="600"
          className="fill-gray-600"
        >
          Total {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
        </tspan>
        <tspan
          x="50%"
          dy="1em"
          fontSize="24"
          fontWeight="bold"
          className="fill-gray-900"
        >
          {total.toLocaleString()}
        </tspan>
      </text>
    );
  };

  const CustomLegend = () => {
    return (
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {currentData.map((entry, index) => {
          return (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-700 font-medium">
                  {entry.region}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="col-span-1 shadow-none border-0">
      <CardHeader className="mb-0 px-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-md font-semibold">
              Distribution Overview
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              (+43%) than last year
            </p>
          </div>
          <Select
            value={selectedType}
            onValueChange={(value: "sightings" | "reportings") =>
              setSelectedType(value)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sightings">Sightings</SelectItem>
              <SelectItem value="reportings">Reportings</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full flex items-center justify-center">
          <ResponsiveContainer width={300} height={300}>
            <PieChart>
              <Pie
                data={currentData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey={dataKey}
                stroke="none"
              >
                {currentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {renderCustomLabel()}
            </PieChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend />
      </CardContent>
    </Card>
  );
}
