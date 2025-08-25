"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { AddSpeciesDialog } from "@/components/modules/species/SpeciesDialog/AddSpeciesDialog";

interface SpeciesFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
}

export default function SpeciesFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
}: SpeciesFiltersProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search species..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <div className="relative">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Species Category</SelectLabel>
              <SelectItem value="BIRD">Birds</SelectItem>
              <SelectItem value="MAMMAL">Mammals</SelectItem>
              <SelectItem value="REPTILE">Reptiles</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {selectedCategory !== "" && (
          <X
            className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCategory("");
            }}
          />
        )}
      </div>

      {/* Conservation Status Filter */}
      <div className="relative">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Conservation Status</SelectLabel>
              <SelectItem value="CRITICALLY_ENDANGERED">
                Critically Endangered
              </SelectItem>
              <SelectItem value="ENDANGERED">Endangered</SelectItem>
              <SelectItem value="VULNERABLE">Vulnerable</SelectItem>
              <SelectItem value="NEAR_THREATENED">Near Threatened</SelectItem>
              <SelectItem value="LEAST_CONCERN">Least Concern</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {selectedStatus !== "" && (
          <X
            className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedStatus("");
            }}
          />
        )}
      </div>

      <div className="flex items-center justify-end">
        <AddSpeciesDialog />
      </div>
    </div>
  );
}
