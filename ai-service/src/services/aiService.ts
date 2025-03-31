export const processAI = async (data: string): Promise<string> => {
  try {
    // AI processing simulation
    return `Processed CV: ${data}`;
  } catch (error) {
    console.error("Error processing AI:", error);
    throw error;
  }
};
