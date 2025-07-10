// services/openRouterService.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const chatWithOpenRouter = async (userMessage) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-4o",
      messages: [
        { role: "system", content: "You are an intelligent assistant helping users with philosophical questions and everyday advice. Add humor and keep the tone engaging and light-hearted." },
        { role: "user", content: userMessage }
      ]
    },
    {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Optional Headers (for OpenRouter rankings):
        "HTTP-Referer": "<YOUR_SITE_URL>",
        "X-Title": "<YOUR_SITE_NAME>",
      }
    }
  );

  return response.data.choices[0].message.content;
};

export { chatWithOpenRouter };
