import mongoose from 'mongoose';

const PatientDataSummarizerSchema = new mongoose.Schema({
    patientNumber: { type: String, required: true },
    summary: { type: Object , required: true },
    createdAt: { type: Date, default: Date.now },
});
export const PatientDataSummarizer = mongoose.model('PatientDataSummarizer', PatientDataSummarizerSchema);