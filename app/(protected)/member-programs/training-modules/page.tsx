"use client";

import React, { Fragment, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ModulesTable from "@/components/modules/training-modules/ModulesTable";
import { useGetModules } from "@/services/modules";
import { useTiersStore } from "@/store/useTiers";
import { useModulesPagination } from "@/store/pagination/useModulesPagination";
import CreateModuleDialog from "@/components/modules/training-modules/CreateModule/CreateModuleDialog";
import { APP_NAME } from "@/constants/constants";
import RouteBreadcrumbs from "@/components/layout/RouteBreadcrumbs";

interface Module {
  id: string;
  tier: string;
  title: {
    en: string;
    bn: string;
  };
  description: {
    en: string;
    bn: string;
  };
  url: string;
  thumbnail: string;
  type: string;
  createdAt: string;
  lastUpdatedAt: string;
}

export default function TrainingModulesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { currentPage, setCurrentPage, totalRecords } = useModulesPagination();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>(
    searchParams.get("tier") || "ALL"
  );

  const { tiers } = useTiersStore();
  const { data, isLoading: isLoadingModules } = useGetModules(selectedTier);

  const modules: Module[] = data?.result || [];

  // TODO: add 'ONBOARDING' tier to DB
  const tierOptions = [
    { label: "ONBOARDING", value: "ONBOARDING" },
    ...(tiers?.map((t) => ({
      label: t.tier.replace("TIER_", "Tier "),
      value: t.tier,
    })) || []),
  ];

  // Filter modules based on search and tier
  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      const matchesSearch =
        module.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.en
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        module.title.bn.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTier =
        selectedTier === "ALL" || module.tier === selectedTier;
      return matchesSearch && matchesTier;
    });
  }, [modules, searchTerm, selectedTier]);

  const handleFilterChange = (filter: string) => {
    setCurrentPage(1);
    setSelectedTier(filter);
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTier("ALL");
    if (searchParams.get("tier"))
      router.push("/member-programs/training-modules");
  };

  return (
    <Fragment>
      <Helmet>
        <title>{APP_NAME} | Training Modules</title>
      </Helmet>

      <div className="py-10 px-12 flex-1 bg-gray-50">
        <div className="mb-4">
          <RouteBreadcrumbs />
        </div>
        <Card className="shadow-none border-0">
          <CardHeader className="pb-0">
            {/* Filters Section */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                {/* Search and Tier Filters */}
                <div className="flex items-center gap-4">
                  <div className="w-[300px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search modules..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 bg-white"
                      />
                    </div>
                  </div>

                  {/* Tier Filter */}
                  <div className="min-w-[150px]">
                    <Select
                      value={selectedTier}
                      onValueChange={handleFilterChange}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Tiers</SelectItem>
                        {tierOptions.map((tier) => (
                          <SelectItem key={tier.value} value={tier.value}>
                            {tier.label.includes("_")
                              ? tier.label.split("_").join(" ")
                              : tier.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Add Module Button */}
                <CreateModuleDialog />
              </div>

              {/* Active Filters Display */}
              {(searchTerm || selectedTier !== "ALL") && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <span className="text-xs font-medium text-gray-500">
                    Active filters:
                  </span>
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      Search: "{searchTerm}"
                    </Badge>
                  )}
                  {selectedTier !== "ALL" && (
                    <Badge variant="secondary" className="text-xs">
                      Tier: {selectedTier.replace("TIER_", "Tier ")}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <ModulesTable
              isLoading={isLoadingModules}
              modules={filteredModules}
              pagination={{
                pageIndex: currentPage,
                pageSize: 10,
                totalRecords,
              }}
              setPagination={setCurrentPage}
            />
          </CardContent>
        </Card>
      </div>
    </Fragment>
  );
}
