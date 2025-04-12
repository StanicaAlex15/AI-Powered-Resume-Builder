import { callAIMLAPI } from "../utils/aimlapiClient";

export const processAI = async (data: string): Promise<string> => {
  try {
    const prompt = `Analizează profesional acest CV și oferă sugestii clare pentru îmbunătățire:\n\n${data}`;
    const response = await callAIMLAPI(prompt);
    return response;
  } catch (error) {
    console.error("Error processing AI:", error);
    throw error;
  }
};
