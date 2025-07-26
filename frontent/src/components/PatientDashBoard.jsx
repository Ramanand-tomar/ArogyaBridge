import React, { useEffect, useState, useContext } from "react";
import Web3 from "web3";
import { useParams, useNavigate } from "react-router-dom";
import { Web3Context } from "../context/Web3Context";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PatientSummary from "./PatientSummary";
import { 
  faUser, 
  faFileMedical, 
  faUpload, 
  faUserShield, 
  faPrescriptionBottle, 
  faClinicMedical, 
  faUserMd, 
  faFileMedicalAlt,
  faSignOutAlt,
  faTimes,
  faIdCard,
  faCalendarAlt,
  faVenusMars,
  faTint,
  faHome,
  faEnvelope,
  faLink
} from '@fortawesome/free-solid-svg-icons';

const PatientDashBoard = () => {
  const backend_url = import.meta.env.VITE_BACKEND_URL;
  const { hhNumber } = useParams();
  const { web3, account, contract, network } = useContext(Web3Context);
  const Navigate = useNavigate();

  // Button click handlers
  const viewRecord = () => Navigate(`/patient/${hhNumber}/viewrecords`);
  const UploadRecords = () => Navigate(`/patient/${hhNumber}/uploadrecords`);
  const GrantPermission = () => Navigate(`/patient/${hhNumber}/grantpermission`);

  // State management
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [PatientContract, setPatientContract] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [DoctorName, setDoctorName] = useState(null);
  const [DoctorHHNumber, setDoctorHHNumber] = useState(null);
  const [analyzerOpen , setanalyzerOpen ] = useState(false);
  const [ipfsHash_to_analyze, setipfsHash_to_analyze] = useState(null);

  // Animation variants
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  // Fetch prescriptions
  const handlePrescriptionDetails = async () => {
    try {
      setShowPrescriptionModal(true);
      const response = await fetch(`${backend_url}/api/prescriptions/${hhNumber}`);
      if (!response.ok) throw new Error("Failed to fetch prescriptions");
      const data = await response.json();
      setPrescriptions(data || []);

      if (data[0]?.doctorNumber) {
        const DoctorNo = await contract.doctor.methods
          .getDoctorDetails(data[0].doctorNumber)
          .call();
        setDoctorName(DoctorNo[1]);
        setDoctorHHNumber(data[0].doctorNumber);
      }
    } catch (err) {
      console.error(err);
      setPrescriptions([]);
    }
  };

  const handleAnalyzer = (ipfsHash)=>{
    console.log(ipfsHash);
    setanalyzerOpen(true);
    setipfsHash_to_analyze(ipfsHash);
  }

  // Load patient data
  useEffect(() => {
    const loadPatientContract = async () => {
      if (!web3 || !contract || !hhNumber) return;
      try {
        const patientContract = contract.patient;
        setPatientContract(patientContract);
        const details = await patientContract.methods
          .getPatientDetails(hhNumber)
          .call();
        setPatientDetails(details);
      } catch (err) {
        console.error("Error loading patient contract:", err);
      }
    };
    loadPatientContract();
  }, [contract, web3, hhNumber]);

  return (
    <div className="relative bg-gradient-to-b from-black to-gray-800 min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 opacity-90">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
          alt="Healthcare Dashboard"
          className="w-full h-full object-cover"
          style={{ filter: "blur(0.5px) brightness(0.95)" }}
        />
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-teal-900/60 z-10" />
      
      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Logout Button */}
        <button
          onClick={() => Navigate("/home")}
          className="absolute top-6 right-6 px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl font-bold text-lg shadow-lg hover:from-gray-900 hover:to-black transition-all duration-200 border border-gray-400/30 flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
          Logout
        </button>

        {/* Dashboard Container */}
        <div className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-6xl animate-fade-in border border-teal-400/30">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 text-teal-300 drop-shadow-lg text-center">
            Patient Dashboard
          </h2>
          
          {patientDetails && (
            <p className="text-2xl sm:text-3xl mb-10 text-white text-center font-semibold">
              Welcome <span className="font-bold text-yellow-400">{patientDetails.name}!</span>
            </p>
          )}

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* View Profile Button */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="group p-6 rounded-xl bg-gradient-to-r from-pink-400 to-teal-400 text-gray-900 font-bold text-lg shadow-lg hover:from-pink-500 hover:to-teal-500 transition-all duration-300 border border-pink-200/30 hover:shadow-xl flex flex-col items-center justify-center h-full"
              whileHover="hover"
              whileTap="tap"
            >
              <div className="w-16 h-16 mb-4 bg-white/30 rounded-full flex items-center justify-center group-hover:rotate-6 transition-transform">
                <FontAwesomeIcon icon={faUser} className="text-white text-2xl" />
              </div>
              View Profile
            </button>

            {/* View Record Button */}
            <button
              onClick={viewRecord}
              className="group p-6 rounded-xl bg-gradient-to-r from-teal-400 to-blue-400 text-gray-900 font-bold text-lg shadow-lg hover:from-teal-500 hover:to-blue-500 transition-all duration-300 border border-teal-200/30 hover:shadow-xl flex flex-col items-center justify-center h-full"
            >
              <div className="w-16 h-16 mb-4 bg-white/30 rounded-full flex items-center justify-center group-hover:rotate-6 transition-transform">
                <FontAwesomeIcon icon={faFileMedical} className="text-white text-2xl" />
              </div>
              View Record
            </button>

            {/* Upload Records Button */}
            <button
              onClick={UploadRecords}
              className="group p-6 rounded-xl bg-gradient-to-r from-yellow-400 to-pink-400 text-gray-900 font-bold text-lg shadow-lg hover:from-yellow-500 hover:to-pink-500 transition-all duration-300 border border-yellow-200/30 hover:shadow-xl flex flex-col items-center justify-center h-full"
            >
              <div className="w-16 h-16 mb-4 bg-white/30 rounded-full flex items-center justify-center group-hover:rotate-6 transition-transform">
                <FontAwesomeIcon icon={faUpload} className="text-white text-2xl" />
              </div>
              Upload Records
            </button>

            {/* Grant Permission Button */}
            <button
              onClick={GrantPermission}
              className="group p-6 rounded-xl bg-gradient-to-r from-blue-400 to-teal-400 text-gray-900 font-bold text-lg shadow-lg hover:from-blue-500 hover:to-teal-500 transition-all duration-300 border border-blue-200/30 hover:shadow-xl flex flex-col items-center justify-center h-full"
            >
              <div className="w-16 h-16 mb-4 bg-white/30 rounded-full flex items-center justify-center group-hover:rotate-6 transition-transform">
                <FontAwesomeIcon icon={faUserShield} className="text-white text-2xl" />
              </div>
              Grant Permission
            </button>

            {/* Prescription Details Button */}
            <button
              onClick={handlePrescriptionDetails}
              className="group p-6 rounded-xl bg-gradient-to-r from-green-400 to-blue-400 text-gray-900 font-bold text-lg shadow-lg hover:from-green-500 hover:to-blue-500 transition-all duration-300 border border-green-200/30 hover:shadow-xl flex flex-col items-center justify-center h-full"
            >
              <div className="w-16 h-16 mb-4 bg-white/30 rounded-full flex items-center justify-center group-hover:rotate-6 transition-transform">
                <FontAwesomeIcon icon={faPrescriptionBottle} className="text-white text-2xl" />
              </div>
              Prescriptions
            </button>

            {/* Diagnostic Report Button */}
            <button
              onClick={() => Navigate(`/patient/${hhNumber}/diagnosticreport`)}
              className="group p-6 rounded-xl bg-gradient-to-r from-purple-400 to-indigo-400 text-gray-900 font-bold text-lg shadow-lg hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 border border-purple-200/30 hover:shadow-xl flex flex-col items-center justify-center h-full"
            >
              <div className="w-16 h-16 mb-4 bg-white/30 rounded-full flex items-center justify-center group-hover:rotate-6 transition-transform">
                <FontAwesomeIcon icon={faClinicMedical} className="text-white text-2xl" />
              </div>
              Diagnostic Report
            </button>

            {/* Doctors List Button */}
            <button
              onClick={() => Navigate(`/patient/${hhNumber}/permissiongrateddoctors`)}
              className="group p-6 rounded-xl bg-gradient-to-r from-orange-400 to-red-400 text-gray-900 font-bold text-lg shadow-lg hover:from-orange-500 hover:to-red-500 transition-all duration-300 border border-orange-200/30 hover:shadow-xl flex flex-col items-center justify-center h-full"
            >
              <div className="w-16 h-16 mb-4 bg-white/30 rounded-full flex items-center justify-center group-hover:rotate-6 transition-transform">
                <FontAwesomeIcon icon={faUserMd} className="text-white text-2xl" />
              </div>
              Doctors List
            </button>

            {/* Health Summary Button */}
            <button
              onClick={() => Navigate(`/patient/${hhNumber}/summarizeyourself`)}
              className="group p-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-400 text-gray-900 font-bold text-lg shadow-lg hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 border border-cyan-200/30 hover:shadow-xl flex flex-col items-center justify-center h-full"
            >
              <div className="w-16 h-16 mb-4 bg-white/30 rounded-full flex items-center justify-center group-hover:rotate-6 transition-transform">
                <FontAwesomeIcon icon={faFileMedicalAlt} className="text-white text-2xl" />
              </div>
              Health Summary
            </button>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && patientDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div 
            className="w-full max-w-2xl bg-gray-900 bg-opacity-95 backdrop-blur-lg p-8 rounded-3xl shadow-2xl relative"
            initial="hidden"
            animate="visible"
            variants={modalVariants}
          >
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-pink-400 text-2xl focus:outline-none"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="flex flex-col items-center mb-8">
              <div className="bg-gradient-to-tr from-pink-400 to-teal-400 rounded-full p-4 mb-4 shadow-lg">
                <FontAwesomeIcon icon={faUser} className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-pink-300">Patient Profile</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faIdCard} className="text-pink-300" />
                  <div>
                    <p className="text-gray-400 text-sm">Name</p>
                    <p className="text-xl font-bold text-white">{patientDetails.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-pink-300" />
                  <div>
                    <p className="text-gray-400 text-sm">DOB</p>
                    <p className="text-lg text-white">{patientDetails.dateOfBirth}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faVenusMars} className="text-pink-300" />
                  <div>
                    <p className="text-gray-400 text-sm">Gender</p>
                    <p className="text-lg text-white">{patientDetails.gender}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faTint} className="text-pink-300" />
                  <div>
                    <p className="text-gray-400 text-sm">Blood Group</p>
                    <p className="text-lg text-white">{patientDetails.bloodGroup}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faHome} className="text-teal-300 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">Address</p>
                    <p className="text-lg text-teal-200">{patientDetails.homeAddress}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faEnvelope} className="text-teal-300" />
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-lg text-teal-200">{patientDetails.email}</p>
                  </div>
                </div>
                
                <div className="mt-6 bg-gray-800 text-pink-400 px-4 py-2 rounded-full font-bold text-center">
                  HH Number: {hhNumber}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Modal */}



      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div 
            className="w-full max-w-2xl bg-gray-900 bg-opacity-95 backdrop-blur-lg p-8 rounded-3xl shadow-2xl relative"
            initial="hidden"
            animate="visible"
            variants={modalVariants}
          >
            <button
              onClick={() => setShowPrescriptionModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-green-400 text-2xl focus:outline-none"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <h2 className="text-3xl font-extrabold mb-6 text-green-300 text-center">
              Prescription Details
            </h2>
            
            {prescriptions.length > 0 ? (
              <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-4">
                {prescriptions.map((pres, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-4 shadow animate-fade-in">
                    <h3 className="text-xl font-bold text-green-300 mb-2">{pres.title}</h3>
                    <p className="text-white mb-3">{pres.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faUserMd} />
                        <span>Dr. {DoctorName || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>{pres.date}</span>
                      </div>
                    </div>
                    
                    <a
                      href={`https://ipfs.io/ipfs/${pres.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mt-3"
                    >
                      <FontAwesomeIcon icon={faLink} />
                      View Electronic File
                    </a>
                    <button
                      onClick={() => handleAnalyzer(pres.ipfsHash)}
                      className="ml-4 px-4 py-2 cursor-pointer bg-blue-500 hover:bg-blue-600 rounded font-bold text-white transition-all duration-150"
                    >
                      Summary
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-300 text-center">No prescriptions found</p>
            )}
          </div>
        </div>
      )}
      {analyzerOpen?<PatientSummary ipfsHash={ipfsHash_to_analyze} setAnalyzerOpen={setanalyzerOpen}  />:null}

    </div>
  );
};

export default PatientDashBoard;