"use client";

import React from "react";
import UserSubmissions from "@/components/modules/users/Submissions";
import RouteBreadcrumbs from "@/components/layout/RouteBreadcrumbs";

export default function SubmissionTypePage() {
  return (
    <>
      <div className="py-10 px-12 flex-1 bg-gray-50">
        <div className="mb-4">
          <RouteBreadcrumbs />
        </div>
        <UserSubmissions />
      </div>
    </>
  );
}
