import React, { useState } from "react";
import medicineData from "../assets/data.json";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faShoppingCart,
  faPills,
  faSyringe,
  faCapsules,
  faTablets,
  faFlask,
  faCalendarAlt,
  faDollarSign,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const getUseCaseIcon = (useCase) => {
  if (!useCase) return faPills;
  const lower = useCase.toLowerCase();
  if (
    lower.includes("pain") ||
    lower.includes("fever") ||
    lower.includes("inflammatory")
  )
    return faTablets;
  if (lower.includes("antibiotic") || lower.includes("infection"))
    return faSyringe;
  if (lower.includes("allergy") || lower.includes("antihistamine"))
    return faFlask;
  if (
    lower.includes("acid reflux") ||
    lower.includes("diabetes") ||
    lower.includes("cholesterol") ||
    lower.includes("blood pressure") ||
    lower.includes("thyroid") ||
    lower.includes("asthma") ||
    lower.includes("antidepressant") ||
    lower.includes("beta blocker") ||
    lower.includes("gerd") ||
    lower.includes("relaxant")
  )
    return faCapsules;
  return faPills;
};

const MedicineApp = () => {
  const [medicines] = useState(medicineData.medicines || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUseCase, setFilterUseCase] = useState("all");
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const useCases = [
    "all",
    ...new Set(medicines.map((med) => med?.use_case || "").filter(Boolean)),
  ];

  const filteredMedicines = medicines.filter((medicine) => {
    const name = medicine?.name?.toLowerCase() || "";
    const useCase = medicine?.use_case?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    const matchesSearch = name.includes(search) || useCase.includes(search);
    const matchesUseCase =
      filterUseCase === "all" || medicine?.use_case === filterUseCase;
    return matchesSearch && matchesUseCase;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans relative">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-indigo-400 mb-2 tracking-wide animate-bounce">
          Pharmacy Inventory
        </h1>
        <p className="text-gray-300 text-lg">
          Your trusted source for health essentials
        </p>
        <div className="w-24 h-1 bg-indigo-500 mx-auto mt-4 rounded-full"></div>
      </header>

      {/* Search and Filter */}
      <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Search medicines by name or use case..."
            className="w-full p-4 rounded-xl border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400 
              focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="w-full p-4 rounded-xl border border-gray-700 bg-gray-800 text-gray-100 
              focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 appearance-none pr-10"
            value={filterUseCase}
            onChange={(e) => setFilterUseCase(e.target.value)}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%239CA3AF'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
              backgroundSize: "1.5em 1.5em",
            }}
          >
            {useCases.map((useCase) => (
              <option key={useCase} value={useCase}>
                {useCase === "all" ? "All Use Cases" : useCase}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Medicine List & Detail Section */}
      <div className="flex flex-col justify-evenly md:flex-row gap-6">
        {/* Medicine List */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${selectedMedicine ? '3' : '4'} gap-6`}
        >
          {filteredMedicines.length > 0 ? (
            filteredMedicines.map((medicine) => (
              <div
                key={medicine?.name || Math.random()}
                className="bg-gray-800 rounded-xl shadow-xl overflow-hidden 
                  hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer
                  border border-gray-700 hover:border-indigo-600 relative group"
                onClick={() => setSelectedMedicine(medicine)}
              >
                <div className="absolute inset-0 rounded-xl pointer-events-none border-2 border-transparent group-hover:border-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="h-48 overflow-hidden bg-gray-700 flex items-center justify-center">
                  <img
                    src={
                      medicine?.image
                        ? `/${medicine.image}`
                        : "https://placehold.co/300x200/2F2F2F/E0E0E0?text=No+Image&font=lato"
                    }
                    alt={medicine?.name || "Medicine image"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/300x200/2F2F2F/E0E0E0?text=No+Image&font=lato";
                    }}
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-xl text-indigo-400 mb-2">
                    {medicine?.name || "Unknown Medicine"}
                  </h3>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    <FontAwesomeIcon
                      icon={getUseCaseIcon(medicine?.use_case)}
                      className="mr-2 text-indigo-500"
                    />
                    {medicine?.use_case || "No description available"}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-bold text-green-400 text-lg flex items-center">
                      <FontAwesomeIcon
                        icon={faDollarSign}
                        className="mr-1 text-green-500"
                      />
                      {(medicine?.price || 0).toFixed(2)}
                    </span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        medicine?.expiry_date &&
                        new Date(medicine.expiry_date) > new Date()
                          ? "bg-green-600"
                          : "bg-red-600"
                      } text-white`}
                    >
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                      {medicine?.expiry_date
                        ? new Date(medicine.expiry_date).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-gray-800 rounded-xl shadow-lg">
              <h3 className="text-2xl font-medium text-gray-200 mb-3">
                No medicines found
              </h3>
              <p className="text-gray-400">
                Try adjusting your search or filter criteria.
              </p>
              <FontAwesomeIcon
                icon={faPills}
                className="text-indigo-600 text-6xl mt-6 opacity-50"
              />
            </div>
          )}
        </div>

        {/* Detail View - Modal on mobile, sidebar on lg+ */}
        {selectedMedicine && (
          <>
            {/* Mobile Fullscreen Modal */}
            <div className="fixed w-30 inset-0 z-50 bg-gray-900 bg-opacity-95 p-6 overflow-y-auto lg:hidden">
              <button
                onClick={() => setSelectedMedicine(null)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-400 text-2xl"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>

              <div className="mt-10 fixed w-30 inset-0 z-50 bg-gray-900 bg-opacity-95  overflow-y-auto rounded-xl shadow-lg p-6 border border-gray-700">
                <MedicineDetail medicine={selectedMedicine} />
              </div>
            </div>

            {/* Sidebar for Large Screens */}
            <div className="hidden  lg:block lg:col-span-1 sticky top-8 self-start">
              <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                <button
                  onClick={() => setSelectedMedicine(null)}
                  className="mb-6 text-gray-400 hover:text-indigo-400 text-sm font-medium flex items-center"
                >
                  <FontAwesomeIcon
                    icon={faArrowLeft}
                    className="mr-2 text-indigo-400"
                  />
                  Back to list
                </button>
                <MedicineDetail medicine={selectedMedicine} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Separate detail component
const MedicineDetail = ({ medicine }) => {
  return (
    <>
      <div className="h-64 mb-6 overflow-hidden rounded-lg border border-pink-700 bg-gray-700 flex items-center justify-center">
        <img
          src={
            medicine?.image
              ? `/${medicine.image}`
              : "https://placehold.co/300x200/2F2F2F/E0E0E0?text=No+Image&font=lato"
          }
          alt={medicine?.name || "Medicine image"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src =
              "https://placehold.co/300x200/2F2F2F/E0E0E0?text=No+Image&font=lato";
          }}
        />
      </div>

      <h2 className="text-3xl font-bold text-indigo-400 mb-3">
        {medicine?.name || "Unknown Medicine"}
      </h2>
      <p className="text-gray-300 mb-6 text-base leading-relaxed">
        <FontAwesomeIcon
          icon={getUseCaseIcon(medicine?.use_case)}
          className="mr-2 text-indigo-500"
        />
        {medicine?.use_case || "No description available."}
      </p>

      <div className="space-y-4 mb-8">
        <div>
          <span className="text-sm text-gray-400 flex items-center mb-1">
            <FontAwesomeIcon
              icon={faDollarSign}
              className="mr-2 text-green-500"
            />{" "}
            Price
          </span>
          <p className="font-bold text-green-400 text-2xl">
            ${(medicine?.price || 0).toFixed(2)}
          </p>
        </div>

        <div>
          <span className="text-sm text-gray-400 flex items-center mb-1">
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className="mr-2 text-indigo-500"
            />{" "}
            Expiry Date
          </span>
          <p
            className={`font-medium text-lg ${
              medicine?.expiry_date &&
              new Date(medicine.expiry_date) > new Date()
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {medicine?.expiry_date
              ? new Date(medicine.expiry_date).toLocaleDateString()
              : "N/A"}
            {medicine?.expiry_date &&
              new Date(medicine.expiry_date) < new Date() && (
                <span className="ml-3 text-xs bg-red-700 text-white px-3 py-1 rounded-full font-semibold">
                  Expired
                </span>
              )}
          </p>
        </div>
      </div>

      <button
        className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg 
        transition-colors duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
      >
        <FontAwesomeIcon icon={faShoppingCart} className="mr-3 text-xl" />
        Add to Cart
      </button>
    </>
  );
};

export default MedicineApp;
