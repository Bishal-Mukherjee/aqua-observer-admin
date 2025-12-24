export const convertReportingsToCSV = (data: any[]) => {
  if (!data || data.length === 0) return "";

  // Define CSV headers with more detailed breakdown
  const headers = [
    "ID",
    "Latitude",
    "Longitude",
    "Revenue Village",
    "Block",
    "District",
    "Species Details",
    "Causes",
    "Observed At",
    "Submitted By",
  ];

  // Convert data to CSV rows
  const rows = data.map((item) => {
    // Format species with detailed breakdown
    const speciesDetails =
      item.species
        ?.map((s: any) => {
          const parts = [];

          // Adult counts
          if (s.adult.stranded + s.adult.injured + s.adult.dead > 0) {
            parts.push(
              `Adult(S:${s.adult.stranded} I:${s.adult.injured} D:${s.adult.dead})`
            );
          }

          // Adult Male counts
          if (
            s.adultMale.stranded + s.adultMale.injured + s.adultMale.dead >
            0
          ) {
            parts.push(
              `Male(S:${s.adultMale.stranded} I:${s.adultMale.injured} D:${s.adultMale.dead})`
            );
          }

          // Adult Female counts
          if (
            s.adultFemale.stranded +
              s.adultFemale.injured +
              s.adultFemale.dead >
            0
          ) {
            parts.push(
              `Female(S:${s.adultFemale.stranded} I:${s.adultFemale.injured} D:${s.adultFemale.dead})`
            );
          }

          // Sub-Adult counts
          if (s.subAdult.stranded + s.subAdult.injured + s.subAdult.dead > 0) {
            parts.push(
              `SubAdult(S:${s.subAdult.stranded} I:${s.subAdult.injured} D:${s.subAdult.dead})`
            );
          }

          return `${s.type}: ${parts.join(", ")}`;
        })
        .join(" | ") || "";

    // Format causes
    const causes =
      item.causes
        ?.map((c: any) => {
          const causeText = c.cause?.join(", ") || "";
          const otherText = c.otherCause ? ` (${c.otherCause})` : "";
          return `${c.species}: ${causeText}${otherText}`;
        })
        .join(" | ") || "";

    // Combine submitter info
    const submittedBy = item.submittedBy
      ? `${item.submittedBy.name} (${item.submittedBy.phoneNumber})`
      : "";

    // Format observed date as DD/MM/YYYY HH:MM (AM/PM)
    const observedDate = new Date(item.observedAt);
    const day = String(observedDate.getDate()).padStart(2, "0");
    const month = String(observedDate.getMonth() + 1).padStart(2, "0");
    const year = observedDate.getFullYear();
    let hours = observedDate.getHours();
    const minutes = String(observedDate.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const observedAt = `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;

    return [
      item.id,
      item.latitude,
      item.longitude,
      item.villageOrGhat,
      item.block,
      item.district,
      speciesDetails,
      causes,
      observedAt,
      submittedBy,
    ];
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(","))
    .join("\n");

  return csvContent;
};

export const convertSightingsToCSV = (data: any[]) => {
  if (!data || data.length === 0) return "";

  // Define CSV headers for sightings
  const headers = [
    "ID",
    "Latitude",
    "Longitude",
    "Revenue Village",
    "Block",
    "District",
    "Species Details",
    "Water Body",
    "Water Body Condition",
    "Weather Condition",
    "Threats",
    "Fishing Gears",
    "Notes",
    "Observed At",
    "Submitted By",
  ];

  // Convert data to CSV rows
  const rows = data.map((item) => {
    // Format species details
    const speciesDetails =
      item.species
        ?.map((s: any) => {
          const parts = [];

          // Adult counts
          if (s.adult > 0) {
            parts.push(`Adult: ${s.adult}`);
          }

          // Adult Male counts
          if (s.adultMale > 0) {
            parts.push(`Male: ${s.adultMale}`);
          }

          // Adult Female counts
          if (s.adultFemale > 0) {
            parts.push(`Female: ${s.adultFemale}`);
          }

          // Sub-Adult counts
          if (s.subAdult > 0) {
            parts.push(`SubAdult: ${s.subAdult}`);
          }

          return `${s.type}: ${parts.join(", ")}`;
        })
        .join(" | ") || "";

    // Format threats
    const threats = item.threats?.join(", ") || "";

    // Format fishing gears
    const fishingGears = item.fishingGears?.join(", ") || "";

    // Combine submitter info
    const submittedBy = item.submittedBy
      ? `${item.submittedBy.name} (${item.submittedBy.phoneNumber})`
      : "";

    // Format observed date as DD/MM/YYYY HH:MM (AM/PM)
    const observedDate = new Date(item.observedAt);
    const day = String(observedDate.getDate()).padStart(2, "0");
    const month = String(observedDate.getMonth() + 1).padStart(2, "0");
    const year = observedDate.getFullYear();
    let hours = observedDate.getHours();
    const minutes = String(observedDate.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const observedAt = `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;

    return [
      item.id,
      item.latitude,
      item.longitude,
      item.villageOrGhat,
      item.block,
      item.district,
      speciesDetails,
      item.waterBody || "",
      item.waterBodyCondition || "",
      item.weatherCondition || "",
      threats,
      fishingGears,
      item.notes || "",
      observedAt,
      submittedBy,
    ];
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(","))
    .join("\n");

  return csvContent;
};
