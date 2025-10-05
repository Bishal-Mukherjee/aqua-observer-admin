"use client";

import React, { Fragment, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Helmet } from "react-helmet-async";
import { useGetUsers } from "@/services/users";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import UsersTable from "@/components/modules/users/UsersTable";
import UserCreateDialog from "@/components/modules/users/UserCreateDialog";
import RouteBreadcrumbs from "@/components/layout/RouteBreadcrumbs";
import { APP_NAME } from "@/constants/constants";
import { useUsersPagination } from "@/store/pagination/useUsersPagination";
import { useTiersStore } from "@/store/useTiers";

interface UserData {
  id: string;
  name: string;
  phoneNumber: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  role: "SIGHTER" | "SUB_ADMIN";
  tier: string;
  status: "ACTIVE" | "SUSPENDED";
  age: number;
  email: string | null;
  occupation: string | null;
  createdAt: string;
  lastActiveAt: string;
  reportingsCount: string;
  sightingsCount: string;
}

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { tiers } = useTiersStore();
  const { currentPage, setCurrentPage, totalRecords } = useUsersPagination();

  const { data, isLoading } = useGetUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>(
    searchParams.get("tier") || "all"
  );
  const [genderFilter, setGenderFilter] = useState<string>("all");

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRoleFilter("all");
    setTierFilter("all");
    setGenderFilter("all");
    if (searchParams.get("tier")) router.push("/users");
  };

  const hasActiveFilters =
    searchTerm ||
    statusFilter !== "all" ||
    roleFilter !== "all" ||
    tierFilter !== "all" ||
    genderFilter !== "all";

  const filteredUsers = data?.result.filter((user: UserData) => {
    const matchesSearchTerm =
      user?.name && user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === "all" || user.tier === tierFilter;
    return matchesSearchTerm && matchesTier;
  });

  return (
    <Fragment>
      <Helmet>
        <title>{APP_NAME} | Users</title>
      </Helmet>

      <div className="py-10 px-12 flex-1 bg-gray-50">
        <div className="mb-4">
          <RouteBreadcrumbs />
        </div>
        {/* <UsersTable users={users} isLoading={isLoading} /> */}
        <Card className="shadow-none border-0">
          <CardHeader className="pb-0">
            {/* Filters Section */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex flex-wrap gap-4">
                {/* Search Filter */}
                <div className="w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 bg-white"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] bg-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Role Filter */}
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[140px] bg-white">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="SIGHTER">Sighter</SelectItem>
                      <SelectItem value="SUB_ADMIN">Sub Admin</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Tier Filter */}
                  <Select value={tierFilter} onValueChange={setTierFilter}>
                    <SelectTrigger className="w-[140px] bg-white">
                      <SelectValue placeholder="Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      {tiers.map((tier) => (
                        <SelectItem key={tier.id} value={tier.tier}>
                          {tier.tier.replace("TIER_", "Tier ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <UserCreateDialog />
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && !isLoading && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <span className="text-xs font-medium text-gray-500">
                    Active filters:
                  </span>
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      Search: "{searchTerm}"
                    </Badge>
                  )}
                  {statusFilter !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Status: {statusFilter}
                    </Badge>
                  )}
                  {roleFilter !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Role: {roleFilter}
                    </Badge>
                  )}
                  {tierFilter !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Tier: {tierFilter.replace("TIER_", "Tier ")}
                    </Badge>
                  )}
                  {genderFilter !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Gender: {genderFilter}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3 w-3" />
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <UsersTable
              isLoading={isLoading}
              users={filteredUsers || []}
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
