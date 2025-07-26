import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { ReportAnalyzerModel } from '../models/ReportAnalyzerSchema.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeMedicalFileFromIPFS = async (req, res) => {
  const { ipfsUrl } = req.body;

  try {
    if (!ipfsUrl) {
      return res.status(400).json({ error: "IPFS URL is required" });
    }

    // 🔍 Check for existing report in DB
    const existingReport = await ReportAnalyzerModel.findOne({ ipfsUrl });
    if (existingReport) {
      console.log("📦 Returning existing report from DB.");
      return res.json({ report: existingReport.report });
    }

    // 🤖 Load Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 🧠 Prompt for Gemini
    const prompt = `
      You are ArogyaBridge Medical AI. Analyze this medical report PDF/image available at this IPFS URL: ${ipfsUrl}

      Generate a JSON summary **for a doctor** including:
      {
        "summary": "Easy to Understand Short description of diagnosis",
        "critical_findings": ["Finding 1", "Finding 2", ...],
        "recommended_tests": ["Test 1", "Test 2", ...],
        "suggested_treatment": ["Treatment 1", "Treatment 2", ...],
        "urgency": "Low | Medium | High"
      }

      Do not return explanation. Only return valid JSON inside a single object.
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // 🧹 Clean Gemini markdown formatting
    if (text.startsWith("```json")) {
      text = text
        .replace(/^```json\s*/, "")
        .replace(/```$/, "")
        .trim();
    }

    const jsonResponse = JSON.parse(text);

    // ✅ Ensure all required fields exist
    const { summary, critical_findings, recommended_tests, suggested_treatment, urgency } = jsonResponse;

    if (
      !summary ||
      !Array.isArray(critical_findings) ||
      !Array.isArray(recommended_tests) ||
      !Array.isArray(suggested_treatment) ||
      !urgency
    ) {
      return res.status(400).json({ error: "Incomplete data in AI response." });
    }

    // 💾 Save to DB
    const newRecord = new ReportAnalyzerModel({ ipfsUrl, report: jsonResponse });
    await newRecord.save();

    console.log("✅ JSON Response:", jsonResponse);
    res.json({ report: jsonResponse });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Failed to process medical report." });
  }
};

export { analyzeMedicalFileFromIPFS };
