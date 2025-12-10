import { useEffect } from "react";
import { isEmpty } from "lodash";
import { useStaticLookup } from "@/store/useStaticLookup";
import { getStaticLookupData } from "@/services/static-lookup";

const formatStaticLookup = (
  data: { label: { en: string; bn: string }; value: string }[]
): { label: string; value: string }[] => {
  if (isEmpty(data)) {
    return [];
  }

  return data.map((item) => ({
    label: item.label.en,
    value: item.value,
  }));
};

export const useInitializeStaticLookup = () => {
  const {
    initializeStore,
    disturbances,
    fishingGears,
    waterBodies,
    waterBodyConditions,
    weatherConditions,
  } = useStaticLookup();

  useEffect(() => {
    const fetchStaticLookupData = async () => {
      try {
        // Only fetch data that hasn't been loaded yet
        const fetchPromises = [];

        if (isEmpty(disturbances)) {
          fetchPromises.push(
            getStaticLookupData("disturbances").then((data) => ({
              key: "disturbances",
              data: formatStaticLookup(data),
            }))
          );
        }

        if (isEmpty(fishingGears)) {
          fetchPromises.push(
            getStaticLookupData("fishing_gears").then((data) => ({
              key: "fishingGears",
              data: formatStaticLookup(data),
            }))
          );
        }

        if (isEmpty(waterBodies)) {
          fetchPromises.push(
            getStaticLookupData("water_bodies").then((data) => ({
              key: "waterBodies",
              data: formatStaticLookup(data),
            }))
          );
        }

        if (isEmpty(waterBodyConditions)) {
          fetchPromises.push(
            getStaticLookupData("water_body_conditions").then((data) => ({
              key: "waterBodyConditions",
              data: formatStaticLookup(data),
            }))
          );
        }

        if (isEmpty(weatherConditions)) {
          fetchPromises.push(
            getStaticLookupData("weather_conditions").then((data) => ({
              key: "weatherConditions",
              data: formatStaticLookup(data),
            }))
          );
        }

        // Only make API calls if there's data to fetch
        if (!isEmpty(fetchPromises)) {
          const results = await Promise.all(fetchPromises);

          // Build the update object with only the fetched data
          const updates: {
            disturbances?: { label: string; value: string }[];
            fishingGears?: { label: string; value: string }[];
            waterBodies?: { label: string; value: string }[];
            waterBodyConditions?: { label: string; value: string }[];
            weatherConditions?: { label: string; value: string }[];
          } = {};

          results.forEach((result) => {
            updates[result.key as keyof typeof updates] = result.data;
          });

          // Initialize the store with fetched data
          initializeStore(updates);
        }
      } catch (error) {
        console.error("Failed to fetch static lookup data:", error);
      }
    };

    fetchStaticLookupData();
  }, [
    initializeStore,
    disturbances.length,
    fishingGears.length,
    waterBodies.length,
    waterBodyConditions.length,
    weatherConditions.length,
  ]);
};
