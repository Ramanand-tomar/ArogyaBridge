import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Web3Context } from '../context/Web3Context';
import { FaUserMd, FaTrashAlt } from 'react-icons/fa';

const PermissionGrantedDoctors = () => {
  const { web3, account, contract } = useContext(Web3Context);
  const { hhNumber } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDoctors = async () => {
    if (!contract || !hhNumber || !account) return;
    setLoading(true);
    try {
      const result = await contract.patient.methods
        .getPermissionGrantedDoctors(hhNumber)
        .call();
      setData(result || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDoctors();
  }, [contract, hhNumber, account]);

  const revokePermission = async (doctorNumber) => {
    try {
      await contract.patient.methods
        .revokePermission(hhNumber, doctorNumber)
        .send({ from: account });
      alert(`Permission revoked for doctor: ${doctorNumber}`);
      fetchDoctors(); // refresh list
    } catch (err) {
      console.error('Revoke failed:', err);
      alert('Error revoking permission.');
    }
  };

  const cancelOperation = () => {
    navigate(`/patient/${hhNumber}`); // or wherever you want to go
  };

  return (
    <div className="bg-gradient-to-b from-black to-gray-800 p-4 sm:p-10 font-mono text-white flex flex-col justify-center items-center min-h-screen">
      <div className="w-full max-w-3xl bg-gray-900 bg-opacity-80 backdrop-blur-lg p-10 rounded-3xl shadow-2xl flex flex-col items-center animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <span className="bg-gradient-to-tr from-yellow-400 to-teal-400 rounded-full p-4 mb-2 shadow-lg">
            <FaUserMd className="h-16 w-16 text-white" />
          </span>
          <h1 className="text-4xl font-extrabold mb-1 text-yellow-300 drop-shadow">
            Permission Granted Doctors
          </h1>
          <p className="text-teal-200 text-center text-base mb-2">
            You can see and revoke doctor permissions below
          </p>
        </div>

        {loading ? (
          <p className="text-white text-lg">Loading doctor list...</p>
        ) : (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {data.length === 0 ? (
              <p className="text-gray-300 text-lg col-span-2">
                No doctors have access to this patient yet.
              </p>
            ) : (
              data.map((doctor, index) => (
                <div
                  key={index}
                  className="flex flex-row justify-between items-center bg-gray-800 p-4 rounded-xl shadow-lg"
                >
                  <div className="text-white font-semibold text-lg flex items-center gap-2">
                    <FaUserMd className="text-teal-400" />
                    {doctor.doctor_number}
                  </div>
                  <button
                    onClick={() => revokePermission(doctor.doctor_number)}
                    className="flex items-center gap-2 px-4 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                  >
                    <FaTrashAlt /> Revoke
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        <button
          onClick={cancelOperation}
          className="mt-6 px-8 py-3 bg-gradient-to-r from-yellow-400 to-teal-400 text-gray-900 font-extrabold text-lg rounded-xl shadow-lg hover:from-yellow-500 hover:to-teal-500 transition-all duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PermissionGrantedDoctors;
