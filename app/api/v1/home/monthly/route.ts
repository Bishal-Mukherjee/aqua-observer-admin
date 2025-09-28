import { NextResponse, type NextRequest } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const GET = withAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { searchParams } = new URL(request.url);
      const type = searchParams.get("type") || "reportings"; // 'reportings' or 'sightings'
      const year =
        searchParams.get("year") || new Date().getFullYear().toString();

      // Validate type parameter
      if (!["reportings", "sightings"].includes(type)) {
        return NextResponse.json(
          {
            message: 'Invalid type. Must be either "reportings" or "sightings"',
          },
          { status: 400 }
        );
      }

      const tableName = type === "reportings" ? "reportings" : "sightings";

      const client = await pool.connect();

      // First, get the top 5 districts by total count
      const topDistrictsQuery = `
        SELECT district
        FROM ${tableName}
        WHERE EXTRACT(YEAR FROM submitted_at) = $1
          AND district IS NOT NULL
        GROUP BY district
        ORDER BY COUNT(*) DESC
        LIMIT 5
      `;

      const topDistrictsResult = await client.query(topDistrictsQuery, [
        parseInt(year),
      ]);
      const topDistricts = topDistrictsResult.rows.map((row) => row.district);

      // Get monthly data for top districts and others
      const query = `
        SELECT 
          EXTRACT(MONTH FROM submitted_at) as month,
          CASE 
            WHEN district = ANY($2) THEN district
            ELSE 'Others'
          END as region,
          COUNT(*)::integer as count
        FROM ${tableName}
        WHERE EXTRACT(YEAR FROM submitted_at) = $1
          AND district IS NOT NULL
        GROUP BY EXTRACT(MONTH FROM submitted_at), 
                 CASE 
                   WHEN district = ANY($2) THEN district
                   ELSE 'Others'
                 END
        ORDER BY month, region
      `;

      const result = await client.query(query, [parseInt(year), topDistricts]);
      client.release();

      // Transform the data into the format needed for the stacked bar chart
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      // Get all unique regions from the result (top 5 + Others)
      const regions = [...new Set(result.rows.map((item) => item.region))];

      // Sort regions to put 'Others' at the end
      const sortedRegions = regions
        .filter((r) => r !== "Others")
        .concat(regions.includes("Others") ? ["Others"] : []);

      // Create the chart data structure
      const chartData = months.map((month, index) => {
        const monthNumber = index + 1;
        const monthData: any = { month };

        let total = 0;
        sortedRegions.forEach((region) => {
          const regionData = result.rows.find(
            (item) =>
              parseInt(item.month) === monthNumber && item.region === region
          );
          const count = regionData ? regionData.count : 0;
          monthData[region] = count;
          total += count;
        });

        monthData.total = total;
        return monthData;
      });

      // Get summary stats
      const totalCount = result.rows.reduce((sum, item) => sum + item.count, 0);

      const regionSummary = sortedRegions.map((region) => {
        const regionTotal = result.rows
          .filter((item) => item.region === region)
          .reduce((sum, item) => sum + item.count, 0);

        return {
          region,
          total: regionTotal,
          percentage:
            totalCount > 0
              ? ((regionTotal / totalCount) * 100).toFixed(1)
              : "0.0",
        };
      });

      return NextResponse.json(
        {
          message: "Monthly statistics fetched successfully",
          result: {
            chartData,
            summary: {
              total: totalCount,
              year: parseInt(year),
              type,
              regions: regionSummary,
            },
            metadata: {
              regions: sortedRegions,
              topDistricts,
            },
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
);
