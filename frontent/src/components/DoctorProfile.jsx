import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Web3Context } from "../context/Web3Context";

const DoctorProfile = () => {
  const { web3, account, contract, network } = React.useContext(Web3Context);

  const { hhNumber } = useParams();
  const navigate = useNavigate();
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        if (!web3 || !account || !contract) {
          alert("Web3 or contract not initialized");
          return;
        }
        const result = await contract.doctor.methods
          .getDoctorDetails(hhNumber)
          .call();
        setDoctorDetails(result);
      } catch (err) {
        console.error("Error fetching doctor details:", err);
        setError("Failed to fetch doctor details");
      }
    };

    fetchDoctorDetails();
  }, [hhNumber]);

  const cancelOperation = async () => {
    try {
      navigate("/doctor/" + hhNumber);
    } catch (error) {
      console.error("Error checking permission:", error);
    }
  };

  return (
    <div>
      {/* <NavBar_Logout></NavBar_Logout> */}
      <div className="bg-gradient-to-b from-black to-gray-800 p-4 sm:p-10 font-mono text-white flex flex-col justify-center items-center min-h-screen">
        <div className="w-full max-w-2xl bg-gray-900 bg-opacity-80 backdrop-blur-lg p-10 rounded-3xl shadow-2xl flex flex-col items-center animate-fade-in">
          <div className="flex flex-col items-center mb-8">
            <span className="bg-gradient-to-tr from-yellow-400 to-teal-400 rounded-full p-4 mb-2 shadow-lg">
              <svg
                className="h-16 w-16 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
            </span>
            <h1 className="text-4xl font-extrabold mb-1 text-yellow-300 drop-shadow">
              Doctor's Profile
            </h1>
            <p className="text-teal-200 text-center text-base mb-2">
              Professional and personal details at a glance
            </p>
          </div>
          {doctorDetails && (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="flex flex-col gap-2">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Name
                </span>
                <span className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-yellow-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {doctorDetails[1]}
                </span>
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  DOB
                </span>
                <span className="text-lg text-white">{doctorDetails[3]}</span>
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Gender
                </span>
                <span className="text-lg text-white">{doctorDetails[4]}</span>
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Email
                </span>
                <span className="text-lg text-white">{doctorDetails[5]}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Hospital Name
                </span>
                <span className="text-lg text-teal-300 font-semibold">
                  {doctorDetails[2]}
                </span>
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Specialization
                </span>
                <span className="inline-flex items-center gap-2 text-lg text-teal-200 font-semibold">
                  <svg
                    className="h-5 w-5 text-teal-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3"
                    />
                  </svg>
                  {doctorDetails[6]}
                </span>
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Department
                </span>
                <span className="text-lg text-teal-200 font-semibold">
                  {doctorDetails[7]}
                </span>
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Designation
                </span>
                <span className="text-lg text-teal-200 font-semibold">
                  {doctorDetails[8]}
                </span>
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Work Experience
                </span>
                <span className="text-lg text-teal-200 font-semibold">
                  {doctorDetails[9]}
                </span>
              </div>
            </div>
          )}
          <div className="w-full flex flex-col items-center gap-2">
            <span className="bg-gray-800 text-yellow-400 px-4 py-2 rounded-full font-bold text-lg shadow">
              HH Number: {hhNumber}
            </span>
            <button
              onClick={cancelOperation}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-yellow-400 to-teal-400 text-gray-900 font-extrabold text-lg rounded-xl shadow-lg hover:from-yellow-500 hover:to-teal-500 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
