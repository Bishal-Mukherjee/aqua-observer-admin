"use client";

import React, { Fragment, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { PawPrint } from "lucide-react";
import SpeciesFilters from "@/components/modules/species/SpeciesFilters";
import SpeciesGrid from "@/components/modules/species/SpeciesGrid";
import StatisticsCards from "@/components/modules/species/StatisticsCards";
import { APP_NAME } from "@/constants/constants";
import { isEmpty } from "lodash";
import { useSpecies } from "@/store/useSpecies";

export interface Species {
  id: string;
  label: {
    en: string;
    bn?: string;
  };
  value: string;
  scientificName: string;
  category: string;
  conservationStatus: string;
  habitat: string[];
  regionDistribution: string[];
  identificationFeatures: string[];
  image: string;
  ageGroup: string | null;
  isActive: boolean;
  createdAt: string | null;
  lastUpdatedAt: string | null;
}

export default function SpeciesPage() {
  const { species } = useSpecies();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const filteredSpecies = useMemo(() => {
    if (isEmpty(species)) return [];
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

  const onCardClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
  };

  return (
    <Fragment>
      <Helmet>
        <title>{APP_NAME} | Species</title>
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
          speciesCount={species?.length || 0}
          birdCount={species?.filter((s) => s.category === "BIRD").length || 0}
          mammalCount={
            species?.filter((s) => s.category === "MAMMAL").length || 0
          }
          reptileCount={
            species?.filter((s) => s.category === "REPTILE").length || 0
          }
          onCardClick={onCardClick}
          selectedCategory={selectedCategory}
        />
        <>
          {isEmpty(species) ? (
            <div className="mt-20 h-32 flex flex-col items-center justify-center">
              <PawPrint className="mx-auto mb-2 h-6 w-6 text-gray-400" />
              <h2 className="text-center text-md text-gray-500">
                No Species data available
              </h2>
            </div>
          ) : (
            <SpeciesGrid species={filteredSpecies} />
          )}
        </>
      </div>
    </Fragment>
  );
}
