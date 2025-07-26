import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PatientSummary = ({ ipfsHash, setAnalyzerOpen }) => {
  const backend_url = import.meta.env.VITE_BACKEND_URL;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        setError(null);
        const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
        const response = await fetch(`${backend_url}/api/reportanalyzer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ipfsUrl }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setReport({
          diagnosis_summary: data.report.summary,
          critical_findings: data.report.critical_findings,
          recommended_tests: data.report.recommended_tests,
          suggested_treatment: data.report.suggested_treatment,
          urgency_level: data.report.urgency,
        });
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("Failed to load report. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [ipfsHash, backend_url]);

  const urgencyColors = {
    high: "bg-red-500 border-pink-300 text-pink-800",
    medium: "bg-orange-400 border-orange-300 text-orange-800",
    low: "bg-green-400 border-blue-300 text-blue-800"
  };

  const getUrgencyColor = (level) => {
    const lowerLevel = level?.toLowerCase();
    return urgencyColors[lowerLevel] || "bg-gray-100 border-gray-300 text-gray-800";
  };

  const sectionColors = {
    diagnosis: "border-blue-600 bg-purple-300 text-blue-800",
    critical: "border-pink-00 bg-pink-300 text-pink-800",
    tests: "border-blue-200 bg-orange-300 text-blue-800",
    treatment: "border-blue-200 bg-green-300 text-blue-800"
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center px-4 py-8"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="bg-gray-800 max-w-3xl w-full p-6 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={() => setAnalyzerOpen(false)}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-700 transition-colors duration-200 group"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-400 group-hover:text-gray-200 transition-colors duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center bg-blue-900/20 rounded-full p-3 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-blue-300 animate-bounce">
              ArogyaBridge – Medical Report Analysis
            </h1>
            <p className="text-gray-400 mt-1">Comprehensive patient summary</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mb-4"></div>
              <p className="text-gray-300">Analyzing medical report...</p>
              <p className="text-sm text-gray-500 mt-1">
                This may take a few moments
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center bg-pink-900/20 rounded-full p-3 mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-pink-300 mb-2">
                Error Loading Report
              </h2>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-gray-100 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : report ? (
            <div className="space-y-6">
              <Section
                title="Diagnosis Summary"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
                colorClass={sectionColors.diagnosis}
              >
                <p className="text-gray-800 leading-relaxed">
                  {report.diagnosis_summary}
                </p>
              </Section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Section
                  title="Critical Findings"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-pink-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  }
                  colorClass={sectionColors.critical}
                >
                  <List items={report.critical_findings} />
                </Section>

                <Section
                  title="Recommended Tests"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                  }
                  colorClass={sectionColors.tests}
                >
                  <List items={report.recommended_tests} />
                </Section>
              </div>

              <Section
                title="Suggested Treatment"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                }
                colorClass={sectionColors.treatment}
              >
                <List items={report.suggested_treatment} />
              </Section>

              <div className={`p-4 rounded-xl border ${getUrgencyColor(report.urgency_level)} flex items-start`}>
                <div className="flex-shrink-0 pt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 ${
                      report.urgency_level?.toLowerCase() === 'high' 
                        ? 'text-pink-400' 
                        : report.urgency_level?.toLowerCase() === 'medium' 
                          ? 'text-orange-400' 
                          : 'text-blue-400'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h2 className={`font-semibold text-lg ${
                    report.urgency_level?.toLowerCase() === 'high' 
                      ? 'text-pink-300' 
                      : report.urgency_level?.toLowerCase() === 'medium' 
                        ? 'text-orange-700' 
                        : 'text-blue-700'
                  }`}>
                    Urgency Level
                  </h2>
                  <p className="text-gray-900 font-bold capitalize">
                    {report.urgency_level}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center bg-gray-700 rounded-full p-3 mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-300 mb-2">
                No Report Available
              </h2>
              <p className="text-gray-400">
                The medical report could not be found or is unavailable.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Section = ({ title, icon, colorClass, children }) => (
  <div className={`rounded-xl shadow-sm overflow-hidden border ${colorClass}`}>
    <div className={`flex items-center px-4 py-3 border-b ${colorClass.split(' ')[0]}`}>
      {icon}
      <h2 className="font-semibold ml-2">{title}</h2>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const List = ({ items }) => (
  <ul className="space-y-2">
    {items.map((item, i) => (
      <li key={i} className="flex items-start">
        <span className="flex-shrink-0 mt-1 mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
        <span className="text-gray-800">{item}</span>
      </li>
    ))}
  </ul>
);

export default PatientSummary;