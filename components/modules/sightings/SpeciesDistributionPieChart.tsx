"use client";

import React, { memo, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

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

interface SpeciesDistributionPieChartProps {
  data: any[];
}

function SpeciesDistributionPieChart({
  data,
}: SpeciesDistributionPieChartProps) {
  const chartOption = useMemo<EChartsOption>(() => {
    const speciesCount: Record<string, number> = {};

    data.forEach((report) => {
      report.species.forEach((species: any) => {
        const total =
          (species.adult || 0) +
          (species.adultMale || 0) +
          (species.adultFemale || 0) +
          (species.subAdult || 0);

        if (total > 0) {
          speciesCount[species.type] =
            (speciesCount[species.type] || 0) + total;
        }
      });
    });

    const speciesData = Object.keys(speciesCount).map((type, index) => ({
      name: type.replace(/_/g, " "),
      value: speciesCount[type],
      itemStyle: {
        color: colors[index % colors.length],
      },
    }));

    return {
      tooltip: {
        trigger: "item",
      },
      legend: {
        orient: "horizontal",
        left: "center",
        top: "bottom",
        textStyle: {
          fontSize: 12,
        },
      },
      series: [
        {
          type: "pie",
          radius: "60%",
          center: ["50%", "50%"],
          data: speciesData,
          label: {
            fontSize: 10,
            formatter: "{b} ({c})",
          },
          labelLine: {
            show: true,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          animation: false,
        },
      ],
    };
  }, [data]);

  return (
    <ReactECharts
      option={chartOption}
      style={{ width: "100%", height: "100%" }}
      opts={{ renderer: "canvas" }}
    />
  );
}

export default memo(SpeciesDistributionPieChart);
