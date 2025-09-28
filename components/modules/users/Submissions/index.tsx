"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useGetSpecies } from "@/services/species";
import { useGetReportings } from "@/services/reportings";
import { useGetSightings } from "@/services/sightings";
import SubmissionsTable from "@/components/modules/users/Submissions/SubmissionsTable";
import SubmissionDialog from "@/components/common/SubmissionDialog";

export default function UserSubmissions() {
  const pathname = usePathname();
  const search = useSearchParams();

  const { data: species, isLoading: isLoadingSpecies } = useGetSpecies();
  const { data: reportings, isLoading: isLoadingReportings } = useGetReportings(
    search.get("id") || undefined,
    undefined, // TODO: add from and to date filters
    undefined,
    pathname.includes("reportings")
  );
  const { data: sightings, isLoading: isLoadingSightings } = useGetSightings(
    search.get("id") || undefined,
    undefined, // TODO: add from and to date filters
    undefined,
    pathname.includes("sightings")
  );

  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const results = pathname.includes("reportings")
    ? reportings?.result || []
    : pathname.includes("sightings")
    ? sightings?.result || []
    : [];

  return (
    <>
      <SubmissionsTable
        isLoading={
          isLoadingReportings || isLoadingSightings || isLoadingSpecies
        }
        entries={results}
        onSelect={setSubmissionId}
      />
      <SubmissionDialog
        submissionId={submissionId}
        onClose={() => setSubmissionId(null)}
        speciesData={species?.result || []}
        hideOtherSubmissions
        type={pathname.includes("reportings") ? "REPORTING" : "SIGHTING"}
      />
    </>
  );
}
