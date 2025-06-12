import { callChatGPT } from "../utils/chatGPTClient";

export const analyzeCV = async (cvText: string): Promise<string> => {
  try {
    const prompt = `You are an expert career assistant AI. 
    Your task is to analyze and rewrite the following CV to be optimized for Applicant Tracking Systems (ATS).

    Instructions:
    - Standardize the format using clear section titles like 'Contact Information', 'Professional Summary', 'Work Experience', 'Skills', 'Education'.
    - Include relevant keywords that will make the CV more likely to pass through ATS filters for relevant job roles.
    - Improve the clarity, structure, and readability, ensuring it is optimized for ATS parsing.
    - Use a professional and formal tone throughout.
    - Return the output as clean, plain text (no Markdown, code blocks, or any other formatting).
    - Sections to include:
      - Contact Information (include phone, email, LinkedIn, GitHub if available)
      - Professional Summary (clear and concise career focus)
      - Work Experience (list roles in reverse chronological order)
      - Skills (list technologies, tools, and programming languages)
      - Education (list institutions and degrees with dates)

    Here is the original CV:
    ${cvText}
    `;

    const response = await callChatGPT(prompt);
    return response;
  } catch (error) {
    console.error("Error analyzing CV:", error);
    throw error;
  }
};
