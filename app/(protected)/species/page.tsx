"use client";

import React, { Fragment, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";

import SpeciesFilters from "@/components/modules/species/SpeciesFilters";
import SpeciesGrid from "@/components/modules/species/SpeciesGrid";
import SpeciesGridSkeleton from "@/components/modules/species/LoadingSkeletons/SpeciesGridSkeleton";
import StatisticsCards from "@/components/modules/species/StatisticsCards";
import { useGetSpecies } from "@/services/species";

export interface Label {
  en: string;
  bn?: string | null;
}

export interface Species {
  id: number;
  label: Label;
  value: string;
  scientificName: string;
  category: string;
  conservationStatus: string;
  habitat: string[];
  regionDistribution: string[];
  identificationFeatures: string[];
  image: string;
  ageGroup: string;
  createdAt: string | null;
  lastUpdatedAt: string | null;
  isActive: boolean;
}

export default function SpeciesPage() {
  const { data, isLoading } = useGetSpecies();

  const species: Species[] = data?.result || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const filteredSpecies = useMemo(() => {
    return species
      .filter((animal) => {
        const matchesSearch = animal.label.en
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === "" || animal.category === selectedCategory;
        const matchesStatus =
          selectedStatus === "" || animal.conservationStatus === selectedStatus;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a) => (a.isActive ? -1 : 1));
  }, [searchTerm, selectedCategory, selectedStatus, species]);

  return (
    <Fragment>
      <Helmet>
        <title>Dashboard | Species</title>
      </Helmet>

      <div className="flex-1 space-y-6 px-12 py-8">
        <SpeciesFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />
        <StatisticsCards
          speciesCount={species.length || 0}
          birdCount={species.filter((s) => s.category === "BIRD").length || 0}
          mammalCount={
            species.filter((s) => s.category === "MAMMAL").length || 0
          }
          reptileCount={
            species.filter((s) => s.category === "REPTILE").length || 0
          }
          isLoading={isLoading}
        />
        {isLoading ? (
          <SpeciesGridSkeleton />
        ) : (
          <SpeciesGrid species={filteredSpecies} />
        )}
      </div>
    </Fragment>
  );
}
