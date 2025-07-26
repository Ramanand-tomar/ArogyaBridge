import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Web3Context } from "../context/Web3Context";

const SummarizeYourHealth = () => {
  const backend_url = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { account, contract, web3 } = useContext(Web3Context);
  const { hhNumber } = useParams();

  const [summaryData, setSummaryData] = useState({
    summary: "",
    medicines: [],
    foods: [],
    exercises: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${backend_url}/api/chatbotsummarize/${hhNumber}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        // Ensure all expected fields exist and are arrays
        const processedData = {
          summary: data.summary || "",
          medicines: Array.isArray(data.medicines) ? data.medicines : [],
          foods: Array.isArray(data.foods) ? data.foods : [],
          exercises: Array.isArray(data.exercises) ? data.exercises : []
        };
        
        setSummaryData(processedData);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [contract, hhNumber]);

  // ... rest of your loading and error states remain the same ...

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
        <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-100">Loading your health summary...</h2>
            <p className="text-gray-400 mt-2">Please wait while we process your information</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
        <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/20">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-100">Error loading data</h3>
            <p className="mt-2 text-sm text-gray-400">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 animate-bounce">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Your Health Summary
          </h1>
          <p className="mt-3 text-xl text-gray-300">
            Personalized recommendations based on your condition
          </p>
        </div>

        {summaryData && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-gray-800 shadow-lg overflow-hidden rounded-lg border border-gray-700">
              <div className="px-4 py-5 sm:px-6 bg-gray-700">
                <h3 className="text-lg leading-6 font-medium text-purple-400">
                  Diagnosis Summary
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <p className="text-gray-200 text-lg">{summaryData.summary}</p>
              </div>
            </div>

            {/* Medicines Card */}
            <div className="bg-gray-800 shadow-lg overflow-hidden rounded-lg border border-gray-700">
              <div className="px-4 py-5 sm:px-6 bg-gray-700">
                <h3 className="text-lg leading-6 font-medium text-green-400">
                  Recommended Medicines
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <ul className="space-y-2">
                  {summaryData.medicines.map((medicine, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-200">{medicine}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Foods Card */}
            <div className="bg-gray-800 shadow-lg overflow-hidden rounded-lg border border-gray-700">
              <div className="px-4 py-5 sm:px-6 bg-gray-700">
                <h3 className="text-lg leading-6 font-medium text-yellow-400">
                  Recommended Foods
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {summaryData.foods.map((food, index) => (
                    <div key={index} className="flex items-center bg-gray-700/50 rounded-md p-3 border border-gray-600">
                      <svg className="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-200">{food}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Exercises Card */}
            <div className="bg-gray-800 shadow-lg overflow-hidden rounded-lg border border-gray-700">
              <div className="px-4 py-5 sm:px-6 bg-gray-700">
                <h3 className="text-lg leading-6 font-medium text-blue-400">
                  Exercise Recommendations
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <ul className="space-y-3">
                  {summaryData.exercises.map((exercise, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-blue-500 mr-2 mt-0.5">
                        {exercise.includes("aaram") ? (
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        ) : (
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-gray-200">{exercise}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Back Button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummarizeYourHealth;