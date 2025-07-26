import mongoose from "mongoose";

const ReportAnalyzer = mongoose.Schema({
    ipfsUrl: { type: String, required: true },
    report: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now },
})

export const ReportAnalyzerModel =  mongoose.model('ReportAnalyzer', ReportAnalyzer);