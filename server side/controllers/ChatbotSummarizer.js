import { GoogleGenerativeAI } from "@google/generative-ai";
import { DiagnosisReport } from "../models/DiagnosisReportSchema.js";
import { Prescription } from "../models/PrescriptionSchema.js";
import { PatientDataSummarizer } from "../models/PatientDataSummarizerSchema.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini client with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const ChatbotSummarizer = async (req, res) => {
  const { hhNumber } = req.params;
  const patientNumber = hhNumber;

  if (!patientNumber) {
    return res.status(400).json({ error: "Patient number is required." });
  }

  try {
    // Check if summary already exists
    const existingSummary = await PatientDataSummarizer.findOne({
      patientNumber,
    });
    if (existingSummary) {
      console.log("🧠 Returning cached summary from DB");
      return res.json(existingSummary.summary);
    }

    // Fetch prescription and diagnosis reports
    const prescriptionsData = await Prescription.find({ patientNumber }).lean();
    const diagnosisData = await DiagnosisReport.find({ patientNumber }).lean();

    if (prescriptionsData.length === 0 && diagnosisData.length === 0) {
      return res
        .status(404)
        .json({ error: "No medical data found for this patient." });
    }

    const Prescriptions = prescriptionsData.map((report) => ({
      title: report.title,
      description: report.description,
    }));

    const Diagnosis = diagnosisData.map((report) => ({
      title: report.title,
      description: report.description,
    }));

    const message = `${JSON.stringify(Prescriptions)} ${JSON.stringify(
      Diagnosis
    )}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const chat = model.startChat({
      systemInstruction: {
        parts: [
          {
            text:
              "You are ArogyaBridge, an AI healthcare assistant in a decentralized medical records system built using blockchain.\n" +
              "\n" +
              "Your role is to analyze combined patient diagnosis and prescription data and return a medical **summary in JSON format** that is easy for **doctors** to understand.\n" +
              "\n" +
              "You should infer and generate the following fields:\n" +
              "{\n" +
              '  "summary": "Short and easy-to-understand overview of patient\'s health condition in Hinglish",\n' +
              '  "medicines": ["Medicine Name 1", "Medicine Name 2", ...],\n' +
              '  "foods": ["Suggested food 1", "Suggested food 2", ...],\n' +
              '  "exercises": ["Exercise 1", "Exercise 2", ...]\n' +
              "}\n" +
              "\n" +
              "✅ Use your own medical knowledge to suggest missing parts.\n" +
              "❌ Do NOT explain anything.\n" +
              "❌ Do NOT include greetings.\n" +
              "✅ Return **only valid JSON**. No Markdown or extra text.\n" +
              "\n" +
              'Use Hinglish (English with light Hindi tone) in the "summary" field for natural doctor-style note. Everything else should be plain array of strings.',
          },
        ],
        role: "system",
      },
    });

    const result = await chat.sendMessage(message);
    let replyText = await result.response.text();

    // Remove markdown backticks
    if (replyText.startsWith("```json")) {
      replyText = replyText
        .replace(/^```json\s*/, "")
        .replace(/```$/, "")
        .trim();
    }

    let cleanReply;
    try {
      cleanReply = JSON.parse(replyText);
    } catch (e) {
      console.error("❌ Invalid JSON from Gemini:", replyText);
      return res
        .status(500)
        .json({ error: "Invalid JSON response from Gemini AI." });
    }

    const { summary, medicines, foods, exercises } = cleanReply;

    // if (
    //   !summary ||
    //   !Array.isArray(medicines) ||
    //   !Array.isArray(foods) ||
    //   !Array.isArray(exercises)
    // ) {
    //   return res.status(400).json({ error: "Incomplete AI response. Expected full structured JSON." });
    // }

    if (cleanReply.length === 0) {
      return res
        .status(400)
        .json({
          error: "Incomplete AI response. Expected full structured JSON.",
        });
    }

    // Save to DB
    const newRecord = new PatientDataSummarizer({
      patientNumber,
      summary: cleanReply,
    });
    await newRecord.save();

    res.json(cleanReply);
  } catch (err) {
    console.error("💥 Error in ChatbotSummarizer:", err);
    res
      .status(500)
      .json({ error: "Internal server error during summarization." });
  }
};

export { ChatbotSummarizer };
