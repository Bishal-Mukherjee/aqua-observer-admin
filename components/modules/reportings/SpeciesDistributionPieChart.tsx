"use client";

import React, { memo, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const colors = [
  "#93c5fd",
  "#60a5fa",
  "#3b82f6",
  "#2563eb",
  "#1e40af",
  "#1d4ed8",
  "#1e3a8a",
  "#172554",
];

// Custom tooltip for species pie chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        <p className="text-xs text-gray-900">{payload[0].payload.name}</p>
        <p className="text-xs text-gray-600">
          {payload[0].value.toLocaleString()} individuals
        </p>
      </div>
    );
  }
  return null;
};

// Custom label function for pie chart
const renderCustomizedLabel = (entry: any) => {
  return `${entry.name} (${entry.value})`;
};

interface SpeciesDistributionPieChart {
  data: any[];
}

function SpeciesDistributionPieChart({ data }: SpeciesDistributionPieChart) {
  const speciesData = useMemo(() => {
    const speciesCount: Record<string, number> = {};

    data.forEach((report) => {
      report.species.forEach((species: any) => {
        const total =
          (species.adult?.stranded || 0) +
          (species.adult?.injured || 0) +
          (species.adult?.dead || 0) +
          (species.adultMale?.stranded || 0) +
          (species.adultMale?.injured || 0) +
          (species.adultMale?.dead || 0) +
          (species.adultFemale?.stranded || 0) +
          (species.adultFemale?.injured || 0) +
          (species.adultFemale?.dead || 0) +
          (species.subAdult?.stranded || 0) +
          (species.subAdult?.injured || 0) +
          (species.subAdult?.dead || 0);

        if (total > 0) {
          speciesCount[species.type] =
            (speciesCount[species.type] || 0) + total;
        }
      });
    });

    return Object.keys(speciesCount).map((type, index) => ({
      name: type.replace(/_/g, " "),
      value: speciesCount[type],
      color: colors[index % colors.length],
    }));
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={speciesData}
          cx="50%"
          cy="50%"
          label={renderCustomizedLabel}
          fontSize={10}
          outerRadius={125}
          dataKey="value"
          stroke="none"
          isAnimationActive={false}
        >
          {speciesData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default memo(SpeciesDistributionPieChart);
