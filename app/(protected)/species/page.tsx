"use client";

import React, { Fragment, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";

import SpeciesFilters from "@/components/modules/species/SpeciesFilters";
import SpeciesGrid from "@/components/modules/species/SpeciesGrid";
import StatisticsCards from "@/components/modules/species/StatisticsCards";

import speciesData from "./species.json";

export default function SpeciesPage() {
  const { species } = speciesData;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const filteredSpecies = useMemo(() => {
    return species.filter((animal) => {
      const matchesSearch = animal.label.en
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "" || animal.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "" || animal.conservationStatus === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedStatus]);

  return (
    <Fragment>
      <Helmet>
        <title>Dashboard | Species</title>
        <meta
          name="description"
          content="Manage and observe different species"
        />
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
          speciesCount={species.length}
          birdCount={species.filter((s) => s.category === "BIRD").length}
          mammalCount={species.filter((s) => s.category === "MAMMAL").length}
          reptileCount={species.filter((s) => s.category === "REPTILE").length}
        />
        <SpeciesGrid species={filteredSpecies} />
      </div>
    </Fragment>
  );
}
