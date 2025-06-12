import axios from "axios";
import dotenv from "dotenv";
import https from "https";
import axiosRetry from "axios-retry";

dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY!;
const API_URL =
  process.env.API_URL ?? "https://api.openai.com/v1/chat/completions";

let apiClient: ReturnType<typeof axios.create>;

export const getApiClient = () => {
  if (!apiClient) {
    apiClient = axios.create({
      httpsAgent: new https.Agent({ keepAlive: true }),
      timeout: 300000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    axiosRetry(apiClient, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
    });
  }
  return apiClient;
};

export const callChatGPT = async (prompt: string): Promise<string> => {
  try {
    const client = getApiClient();
    console.log("Making API call to", API_URL);
    const response = await client.post(API_URL, {
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful career assistant AI." },
        { role: "user", content: prompt },
      ],
    });

    console.log("API response received:", response.data);

    const rawResponse = response.data.choices[0].message.content;
    console.log("Raw response:", rawResponse);

    const cleaned = rawResponse.replace(/```markdown|```/g, "").trim();
    console.log("Cleaned response:", cleaned);
    return cleaned;
  } catch (error: any) {
    console.error("OpenAI API call failed:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      statusCode: error.response?.status,
    });

    throw new Error(
      `OpenAI API call failed with status: ${
        error.response?.status || "Unknown"
      }`
    );
  }
};
