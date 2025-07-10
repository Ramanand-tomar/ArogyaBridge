import React, { createContext, useEffect, useState } from "react";
import Web3 from "web3";

import Patient_ABI from "../ABI/patient_ABI.json";
import Doctor_ABI from "../ABI/doctor_ABI.json";
import Diagnosis_ABI from "../ABI/diagnosis_ABI.json";

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [network, setNetwork] = useState("");

  const PatientContractAddress = import.meta.env.VITE_PATIENT_CONTRACT_ADDRESS;
  const DoctorContractAddress = import.meta.env.VITE_DOCTOR_CONTRACT_ADDRESS;
  const DiagnosisContractAddress = import.meta.env.VITE_DIAGNOSIS_CONTRACT_ADDRESS;
  
  useEffect(() => {
    const loadWeb3 = async () => {
      try {
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          // Request account access
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
          } else {
            console.warn("No accounts found.");
          }

          // Get network ID
          const networkId = await web3Instance.eth.net.getId();
          setNetwork(networkId);

          if (networkId !== 11155111) {
            // Sepolia networkId
            console.warn(
              `You are connected to network ${networkId}, please switch to Sepolia (11155111).`
            );
          }

          // Initialize contracts with addresses on Sepolia
          const patientContract = new web3Instance.eth.Contract(
            Patient_ABI,
            PatientContractAddress
          );
          const doctorContract = new web3Instance.eth.Contract(
            Doctor_ABI,
            DoctorContractAddress
          );
          const diagnosisContract = new web3Instance.eth.Contract(
            Diagnosis_ABI,
            DiagnosisContractAddress
          );

          setContract({
            patient: patientContract,
            doctor: doctorContract,
            diagnosis: diagnosisContract,
          });
        } else {
          console.error("MetaMask not detected. Please install MetaMask.");
        }
      } catch (error) {
        console.error("Error loading Web3:", error);
      }
    };

    loadWeb3();
  }, [
    PatientContractAddress,
    DoctorContractAddress,
    DiagnosisContractAddress,
  ]);

  return (
    <Web3Context.Provider value={{ web3, account, contract, network }}>
      {children}
    </Web3Context.Provider>
  );
};
