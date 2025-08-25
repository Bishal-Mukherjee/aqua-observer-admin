"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface DistrictWiseBarChartProps {
  data: any[];
}

export const DistrictWiseBarChart = ({ data }: DistrictWiseBarChartProps) => {
  // Process data for district-wise reporting bar chart
  const districtData = React.useMemo(() => {
    const districtCount: Record<string, number> = {};

    data.forEach((report) => {
      const district = report.district.replace(/_/g, " ");
      districtCount[district] = (districtCount[district] || 0) + 1;
    });

    // Format for recharts instead of ApexCharts
    return Object.entries(districtCount)
      .map(([district, count]) => ({
        name: district,
        value: count,
      }))
      .sort((a, b) => a.value - b.value); // Sort ascending by count for better visualization
  }, [data]);

  return (
    <Card className="shadow-none border-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Reportings by District
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={districtData}
              margin={{ right: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="4 4" />
              <XAxis type="number" fontSize={10} />
              <YAxis dataKey="name" type="category" width={60} fontSize={10} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-900">
                          {payload[0].payload.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {payload[0].value} reports
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                {districtData.map((entry, index) => (
                  <Cell key={`cell-${index}`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
