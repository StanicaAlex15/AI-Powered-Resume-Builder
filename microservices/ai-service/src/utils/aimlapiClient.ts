import axios from "axios";
import dotenv from "dotenv";
import https from "https";
import axiosRetry from "axios-retry";

dotenv.config();

const API_KEY = process.env.AIML_API_KEY!;
const API_URL =
  process.env.AIML_API_URL ?? "https://api.aimlapi.com/v1/chat/completions";

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

export const callAIMLAPI = async (prompt: string): Promise<string> => {
  try {
    const client = getApiClient();
    const response = await client.post(API_URL, {
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful career assistant AI." },
        { role: "user", content: prompt },
      ],
    });

    const rawResponse = response.data.choices[0].message.content;
    const cleaned = rawResponse.replace(/```markdown|```/g, "").trim();
    return cleaned;
  } catch (error: any) {
    console.error(
      "AIML API call failed:",
      error.response?.data ?? error.message
    );
    throw new Error("AIML API call failed");
  }
};
