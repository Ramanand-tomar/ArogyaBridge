import { ReportAnalyzerModel } from "../models/ReportAnalyzerSchema.js";

const AnalyzeReportStoring = async (req, res) => {
    try {
        const { ipfsHash , Report  } = req.body;
        console.log("Received login record:", req.body);
        const newRecord = new ReportAnalyzerModel({ ipfsHash , Report});
        await newRecord.save();
        res.status(201).json({ message: 'Login record saved', record: newRecord });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save information record' });
    }
};

const AnalyzeReportGetting = async (req , res) => {

    try {

        const records = await ReportAnalyzerModel.find({});
        if(!records ) {
            return res.status(404).json({ error: 'No information found' });
        }
        res.status(200).json(records);
        
    } catch (err) {
        res.status(500).json({ error: 'Failed to getting information' });
        
    }
    
}


export {AnalyzeReportStoring , AnalyzeReportGetting};