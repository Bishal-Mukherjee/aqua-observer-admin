"use client";

import React, { Fragment, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import reportingData from "./data.json";
import {
  ClipboardList,
  PawPrint,
  AlertTriangle,
  HeartPulse,
  Skull,
} from "lucide-react";

// Type definitions
interface SpeciesData {
  type: string;
  adultMale: { stranded: number; injured: number; dead: number };
  adultFemale: { stranded: number; injured: number; dead: number };
  subAdult: { stranded: number; injured: number; dead: number };
}

interface ReportingItem {
  id: string;
  longitude: number;
  latitude: number;
  altitude: number;
  provider: string;
  district: string;
  block: string;
  villageOrGhat: string;
  species: SpeciesData[];
  images: any;
  observed_at: string;
  type: string;
}

export default function SubmissionReportingPage() {
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("date");

  const data: ReportingItem[] = reportingData.reporting;

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = data.filter((item) => {
      const typeMatch = selectedType === "ALL" || item.type === selectedType;
      const districtMatch =
        selectedDistrict === "ALL" || item.district === selectedDistrict;
      return typeMatch && districtMatch;
    });

    // Sort data
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.observed_at).getTime() - new Date(a.observed_at).getTime()
        );
      }
      return a.district.localeCompare(b.district);
    });

    return filtered;
  }, [selectedType, selectedDistrict, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalReports = filteredData.length;
    const totalAnimals = filteredData.reduce((sum, item) => {
      return (
        sum +
        item.species.reduce((speciesSum, species) => {
          const counts = [
            species.adultMale,
            species.adultFemale,
            species.subAdult,
          ];
          return (
            speciesSum +
            counts.reduce(
              (total, count) =>
                total + count.stranded + count.injured + count.dead,
              0
            )
          );
        }, 0)
      );
    }, 0);

    const statusCounts = filteredData.reduce(
      (acc, item) => {
        item.species.forEach((species) => {
          [species.adultMale, species.adultFemale, species.subAdult].forEach(
            (ageGroup) => {
              acc.stranded += ageGroup.stranded;
              acc.injured += ageGroup.injured;
              acc.dead += ageGroup.dead;
            }
          );
        });
        return acc;
      },
      { stranded: 0, injured: 0, dead: 0 }
    );

    return { totalReports, totalAnimals, ...statusCounts };
  }, [filteredData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "stranded":
        return "bg-yellow-100 text-yellow-800";
      case "injured":
        return "bg-orange-100 text-orange-800";
      case "dead":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Fragment>
      <Helmet>
        <title>Submission Reporting</title>
      </Helmet>

      <div className="p-6 flex-1 bg-gray-50 min-h-screen">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <ClipboardList className="text-blue-600 w-8 h-8" />
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalReports}
              </div>
              <div className="text-sm text-gray-600">
                Total Reports submitted by observers
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <PawPrint className="text-green-600 w-8 h-8" />
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalAnimals}
              </div>
              <div className="text-sm text-gray-600">
                Total animals observed in reports
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <AlertTriangle className="text-yellow-600 w-8 h-8" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.stranded}
              </div>
              <div className="text-sm text-gray-600">
                Animals reported as stranded
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <HeartPulse className="text-orange-600 w-8 h-8" />
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {stats.injured}
              </div>
              <div className="text-sm text-gray-600">
                Animals reported as injured
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <Skull className="text-red-600 w-8 h-8" />
            <div>
              <div className="text-2xl font-bold text-red-600">
                {stats.dead}
              </div>
              <div className="text-sm text-gray-600">
                Animals reported as dead
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Types</option>
                {/* Add dynamic options */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Districts</option>
                {/* Add dynamic options */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Date (Latest First)</option>
                <option value="district">District (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Reports ({filteredData.length})
          </h2>

          {filteredData.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              {/* Report Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.type === "NEW_REPORTING"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {report.type.replace("_", " ")}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(report.observed_at)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {report.villageOrGhat}, {report.block}
                    </h3>
                    <p className="text-gray-600">
                      {report.district.replace("_", " ")}
                    </p>
                  </div>
                  <div className="mt-4 lg:mt-0 text-sm text-gray-500">
                    <div>
                      📍 {report.latitude.toFixed(6)},{" "}
                      {report.longitude.toFixed(6)}
                    </div>
                    <div>⛰️ {report.altitude}m altitude</div>
                  </div>
                </div>
              </div>

              {/* Species Data */}
              <div className="p-6">
                <h4 className="font-medium text-gray-900 mb-4">
                  Species Observations
                </h4>
                <div className="space-y-4">
                  {report.species.map((species, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <h5 className="font-medium text-gray-800 mb-3">
                        {species.type.replace(/_/g, " ")}
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Adult Male */}
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-700">
                            Adult Male
                          </div>
                          <div className="flex gap-2">
                            {species.adultMale.stranded > 0 && (
                              <span
                                className={`px-2 py-1 rounded text-xs ${getStatusColor(
                                  "stranded"
                                )}`}
                              >
                                {species.adultMale.stranded} Stranded
                              </span>
                            )}
                            {species.adultMale.injured > 0 && (
                              <span
                                className={`px-2 py-1 rounded text-xs ${getStatusColor(
                                  "injured"
                                )}`}
                              >
                                {species.adultMale.injured} Injured
                              </span>
                            )}
                            {species.adultMale.dead > 0 && (
                              <span
                                className={`px-2 py-1 rounded text-xs ${getStatusColor(
                                  "dead"
                                )}`}
                              >
                                {species.adultMale.dead} Dead
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Adult Female */}
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-700">
                            Adult Female
                          </div>
                          <div className="flex gap-2">
                            {species.adultFemale.stranded > 0 && (
                              <span
                                className={`px-2 py-1 rounded text-xs ${getStatusColor(
                                  "stranded"
                                )}`}
                              >
                                {species.adultFemale.stranded} Stranded
                              </span>
                            )}
                            {species.adultFemale.injured > 0 && (
                              <span
                                className={`px-2 py-1 rounded text-xs ${getStatusColor(
                                  "injured"
                                )}`}
                              >
                                {species.adultFemale.injured} Injured
                              </span>
                            )}
                            {species.adultFemale.dead > 0 && (
                              <span
                                className={`px-2 py-1 rounded text-xs ${getStatusColor(
                                  "dead"
                                )}`}
                              >
                                {species.adultFemale.dead} Dead
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Sub Adult */}
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-700">
                            Sub Adult
                          </div>
                          <div className="flex gap-2">
                            {species.subAdult.stranded > 0 && (
                              <span
                                className={`px-2 py-1 rounded text-xs ${getStatusColor(
                                  "stranded"
                                )}`}
                              >
                                {species.subAdult.stranded} Stranded
                              </span>
                            )}
                            {species.subAdult.injured > 0 && (
                              <span
                                className={`px-2 py-1 rounded text-xs ${getStatusColor(
                                  "injured"
                                )}`}
                              >
                                {species.subAdult.injured} Injured
                              </span>
                            )}
                            {species.subAdult.dead > 0 && (
                              <span
                                className={`px-2 py-1 rounded text-xs ${getStatusColor(
                                  "dead"
                                )}`}
                              >
                                {species.subAdult.dead} Dead
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No reports found matching your filters.
            </div>
          </div>
        )}
      </div>
    </Fragment>
  );
}
