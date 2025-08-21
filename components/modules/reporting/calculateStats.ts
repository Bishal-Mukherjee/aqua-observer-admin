interface SpeciesData {
  type: string;
  adultMale: { stranded: number; injured: number; dead: number };
  adultFemale: { stranded: number; injured: number; dead: number };
  subAdult: { stranded: number; injured: number; dead: number };
}

interface ReportingItem {
  species: SpeciesData[];
}

export function calculateStats(data: ReportingItem[]) {
  const totalAnimals = data.reduce((sum, item) => {
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

  const statusCounts = data.reduce(
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

  return { totalAnimals, ...statusCounts };
}
