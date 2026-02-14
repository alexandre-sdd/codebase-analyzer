import { useState } from "react";
import LandingPage from "./LandingPage";
import ResultsPage from "./ResultsPage";

export default function App() {
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
