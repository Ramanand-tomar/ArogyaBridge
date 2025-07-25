import React, { useState, useEffect, useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { generateMedicalReportPdf } from "../assets/generatePrescriptionPdf";
import { uploadFileToIPFS } from "../assets/uploadToPinata";

const DoctorPrecription = () => {
  const backend_url = import.meta.env.VITE_BACKEND_URL;

  const { web3, contract, account } = useContext(Web3Context);
  const { hhNumber, patient_Number } = useParams();
  const navigate = useNavigate();
  const [doctorContract, setDoctorContract] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const init = async () => {
      if (!web3 || !contract || !hhNumber) {
        setError("Web3 or contract not loaded or hhNumber is missing.");
        setLoading(false);
        return;
      }
      try {
        setDoctorContract(contract.doctor);
        const result = await contract.doctor.methods
          .getDoctorDetails(hhNumber)
          .call();
        setDoctorDetails({
          name: result[1],
          specialization: result[6],
          email: result[5],
          hospital: result[2],
        });
        setError(null);
      } catch (error) {
        setError("Error retrieving doctor details");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [web3, contract, hhNumber]);

  const handleCancel = () => {
    navigate(`/doctor/${hhNumber}/doctorviewpatient/${patient_Number}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess("");
    setError(null);

    try {
      const date = new Date().toISOString().split("T")[0];
      const diagnosticReport = {
        report: {
          summary:
            "Patient presenting with acute viral upper respiratory infection (URI) symptoms, likely self-limiting.",
          critical_findings: [
            "No critical findings identified. Patient's vital signs and general condition appear stable for a viral illness.",
          ],
          recommended_tests: [
            "Rapid antigen tests for Influenza A/B, RSV, and COVID-19 (if not already performed)",
            "Complete Blood Count (CBC) with differential (to rule out secondary bacterial infection if symptoms persist or worsen)",
            "C-reactive protein (CRP) if there is suspicion of significant inflammation",
          ],
          suggested_treatment: [
            "Symptomatic relief: Antipyretics (e.g., acetaminophen or ibuprofen) for fever and body aches",
            "Cough suppressants or expectorants as needed",
            "Adequate hydration with clear fluids",
            "Rest",
            "Isolation precautions to prevent spread of infection",
            "Follow-up if symptoms worsen, develop difficulty breathing, or persistent high fever",
          ],
          urgency: "Low",
        },
      };

      // const data = await fetch(`${backend_url}/api/reportanalyzer`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ diagnosticReport }),
      // });

      // if (!data.ok) {
      //   throw new Error(`HTTP error! status: ${data.status}`);
      // }

      // const report = await data.json();
      // console.log(
      //   "Report from report analyzer:",
      //   report.report.summary,
      //   report.report.critical_findings
      // );

      // 1. First generate the PDF
      const pdfFile = await generateMedicalReportPdf({
        doctorProfile: doctorDetails,
        patientNumber: patient_Number,
        title,
        description,
        date,
        diagnosticReport,
      });
      console.log("PDF File:", pdfFile);

      if (!pdfFile.ipfsHash) {
        throw new Error("Failed to upload PDF to IPFS - no hash returned");
      }

      toast.success(`PDF uploaded to IPFS ✅`);
      console.log("IPFS Hash:", pdfFile.ipfsHash);

      // 3. Save prescription data to MongoDB with IPFS hash
      const prescriptionData = {
        patientNumber: patient_Number,
        doctorNumber: hhNumber,
        title,
        description,
        date,
        ipfsHash: pdfFile.ipfsHash,
        fileName: pdfFile.filename,
      };

      const response = await fetch(`${backend_url}/api/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prescriptionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to store prescription");
      }

      toast.success("Prescription submitted successfully!");
      setSuccess("Prescription created and stored successfully!");

      // Reset form
      setTitle("");
      setDescription("");

      // Navigate after a short delay
      setTimeout(() => {
        navigate(`/doctor/${hhNumber}/doctorviewpatient/${patient_Number}`);
      }, 1500);
    } catch (err) {
      console.error("Error submitting prescription:", err);
      setError(err.message || "Failed to submit prescription");
      toast.error(err.message || "Failed to submit prescription");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-black to-gray-800 p-4 sm:p-10 font-mono text-white flex flex-col justify-center items-center min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="w-full max-w-2xl bg-gray-900 bg-opacity-80 backdrop-blur-lg p-10 rounded-3xl shadow-2xl flex flex-col items-center animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">
          Doctor Prescription
        </h1>
        {doctorDetails && (
          <p className="text-xl sm:text-2xl mb-4">
            Welcome, Dr. {doctorDetails.name}!
          </p>
        )}
        <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
          <div>
            <label className="block font-bold mb-2">Prescription Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
          </div>
          <div>
            <label className="block font-bold mb-2">Description / Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              rows={4}
              required
            />
          </div>
          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-bold text-white transition-all duration-150 shadow disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Prescription"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-bold text-white transition-all duration-150 shadow"
            >
              Cancel
            </button>
          </div>
          {success && (
            <p className="text-green-400 font-bold mt-4">{success}</p>
          )}
          {error && <p className="text-red-400 font-bold mt-4">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default DoctorPrecription;
