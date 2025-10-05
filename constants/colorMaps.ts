// Conservation status color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case "CRITICALLY_ENDANGERED":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800/30";
    case "ENDANGERED":
      return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800/30";
    case "VULNERABLE":
      return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800/30";
    case "NEAR_THREATENED":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800/30";
    case "LEAST_CONCERN":
      return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800/30";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800/30";
  }
};

// Category color mapping
const getCategoryColor = (category: string) => {
  switch (category) {
    case "BIRD":
      return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800/30";
    case "MAMMAL":
      return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800/30";
    case "REPTILE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/30";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800/30";
  }
};

const getSpeciesDisplayColor = (speciesType: string) => {
  const colorMap: Record<string, string> = {
    INDIAN_SKIMMER: "bg-sky-100 text-sky-800 border-sky-300",
    SALTWATER_CROCODILE: "bg-emerald-100 text-emerald-800 border-emerald-300",
    SOFT_SHELLED_TURTLE: "bg-amber-100 text-amber-800 border-amber-300",
    HARD_SHELLED_TURTLE: "bg-orange-100 text-orange-800 border-orange-300",
    MARSH_CROCODILE: "bg-green-100 text-green-800 border-green-300",
    GHARIAL: "bg-purple-100 text-purple-800 border-purple-300",
    IRRAWADDY_DOLPHIN: "bg-blue-100 text-blue-800 border-blue-300",
    SMOOTH_COATED_OTTER: "bg-indigo-100 text-indigo-800 border-indigo-300",
    GANGES_RIVER_DOLPHIN: "bg-cyan-100 text-cyan-800 border-cyan-300",
    ASIAN_OPEN_BILL_STROK: "bg-rose-50 text-rose-800 border-rose-300",
  };
  return colorMap[speciesType] || "bg-gray-100 text-gray-800 border-gray-300";
};

const getTierColor = (tierLevel: string) => {
  const colorMap: Record<string, string> = {
    TIER_1: "bg-green-100 text-green-800 border-green-300",
    TIER_2: "bg-blue-100 text-blue-800 border-blue-300",
    TIER_3: "bg-purple-100 text-purple-800 border-purple-300",
    TIER_4: "bg-orange-100 text-orange-800 border-orange-300",
    TIER_5: "bg-red-100 text-red-800 border-red-300",
  };
  return colorMap[tierLevel] || "bg-gray-100 text-gray-800 border-gray-300";
};

export { getStatusColor, getCategoryColor, getSpeciesDisplayColor, getTierColor };
