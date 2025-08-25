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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const sightingsData = [
  { month: "Jan", murshidabad: 18, hooghly: 12, howrah: 8, south24parganas: 6 },
  {
    month: "Feb",
    murshidabad: 25,
    hooghly: 18,
    howrah: 12,
    south24parganas: 8,
  },
  {
    month: "Mar",
    murshidabad: 22,
    hooghly: 15,
    howrah: 10,
    south24parganas: 7,
  },
  {
    month: "Apr",
    murshidabad: 28,
    hooghly: 20,
    howrah: 14,
    south24parganas: 9,
  },
  {
    month: "May",
    murshidabad: 18,
    hooghly: 25,
    howrah: 18,
    south24parganas: 12,
  },
  {
    month: "Jun",
    murshidabad: 30,
    hooghly: 22,
    howrah: 16,
    south24parganas: 10,
  },
  {
    month: "Jul",
    murshidabad: 5,
    hooghly: 28,
    howrah: 20,
    south24parganas: 14,
  },
  {
    month: "Aug",
    murshidabad: 12,
    hooghly: 24,
    howrah: 17,
    south24parganas: 11,
  },
  {
    month: "Sep",
    murshidabad: 26,
    hooghly: 19,
    howrah: 13,
    south24parganas: 8,
  },
  {
    month: "Oct",
    murshidabad: 16,
    hooghly: 26,
    howrah: 19,
    south24parganas: 13,
  },
  {
    month: "Nov",
    murshidabad: 29,
    hooghly: 21,
    howrah: 15,
    south24parganas: 10,
  },
];

const reportingsData = [
  {
    month: "Jan",
    murshidabad: 25,
    hooghly: 18,
    howrah: 14,
    south24parganas: 10,
  },
  {
    month: "Feb",
    murshidabad: 32,
    hooghly: 24,
    howrah: 18,
    south24parganas: 12,
  },
  {
    month: "Mar",
    murshidabad: 28,
    hooghly: 22,
    howrah: 16,
    south24parganas: 11,
  },
  {
    month: "Apr",
    murshidabad: 35,
    hooghly: 28,
    howrah: 20,
    south24parganas: 15,
  },
  {
    month: "May",
    murshidabad: 24,
    hooghly: 32,
    howrah: 26,
    south24parganas: 18,
  },
  {
    month: "Jun",
    murshidabad: 38,
    hooghly: 30,
    howrah: 22,
    south24parganas: 16,
  },
  {
    month: "Jul",
    murshidabad: 12,
    hooghly: 35,
    howrah: 28,
    south24parganas: 20,
  },
  {
    month: "Aug",
    murshidabad: 18,
    hooghly: 32,
    howrah: 24,
    south24parganas: 16,
  },
  {
    month: "Sep",
    murshidabad: 34,
    hooghly: 26,
    howrah: 18,
    south24parganas: 12,
  },
  {
    month: "Oct",
    murshidabad: 22,
    hooghly: 34,
    howrah: 26,
    south24parganas: 18,
  },
  {
    month: "Nov",
    murshidabad: 36,
    hooghly: 28,
    howrah: 20,
    south24parganas: 14,
  },
];

export default function DistrictMonthlyStackedBar() {
  const [selectedType, setSelectedType] = useState<"sightings" | "reportings">(
    "reportings"
  );

  const currentData =
    selectedType === "sightings" ? sightingsData : reportingsData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-700">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-xs capitalize mt-1"
            >{`${entry.dataKey}: ${entry.value} ${selectedType}`}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-2 shadow-none border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Monthly{" "}
            {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} by
            District
          </CardTitle>
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
      <CardContent className="h-[300px]">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={currentData}
              margin={{
                top: 20,
                right: 20,
                left: -20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={true}
                tick={{ fontSize: 12, fill: "#6B7280" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6B7280" }}
                domain={[0, selectedType === "sightings" ? 80 : 110]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: "12px",
                  fontSize: "12px",
                }}
                iconType="rect"
                iconSize={7}
              />
              <Bar
                dataKey="murshidabad"
                name="Murshidabad"
                stackId="a"
                fill="#93c5fd"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="hooghly"
                name="Hooghly"
                stackId="a"
                fill="#60a5fa"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="howrah"
                name="Howrah"
                stackId="a"
                fill="#3b82f6"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="south24parganas"
                name="South 24 Parganas"
                stackId="a"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
