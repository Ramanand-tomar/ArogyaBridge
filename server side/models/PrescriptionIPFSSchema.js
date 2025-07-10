import mongoose from 'mongoose';

const prescriptionIPFSSchema = new mongoose.Schema({
  patientNumber: { type: String, required: true },
  doctorNumber: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  ipfsHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
export const PrescriptionIPFS = mongoose.model('PrescriptionIPFS', prescriptionIPFSSchema);