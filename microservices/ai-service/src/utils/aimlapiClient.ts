import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.AIML_API_KEY!;
const API_URL = process.env.AIML_API_URL || "https://api.aimlapi.com/v1/gpt4o";

export const callAIMLAPI = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful career assistant AI." },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error("AIML API call failed:", error.response?.data || error);
    throw new Error("AIML API call failed");
  }
};
