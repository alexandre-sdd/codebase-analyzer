"use client";

import { useState } from "react";
import LandingPage from "../components/LandingPage";
import ResultsPage from "../components/ResultsPage";

export default function Home() {
  const [currentPage, setCurrentPage] = useState<"landing" | "results">("landing");
  const [jobId, setJobId] = useState<string | null>(null);

  const handleResultsReady = (id: string) => {
    setJobId(id);
    setCurrentPage("results");
  };

  const handleBack = () => {
    setCurrentPage("landing");
    setJobId(null);
  };

  if (currentPage === "results" && jobId) {
    return <ResultsPage jobId={jobId} onBack={handleBack} />;
  }

  return <LandingPage onResultsReady={handleResultsReady} />;
}
