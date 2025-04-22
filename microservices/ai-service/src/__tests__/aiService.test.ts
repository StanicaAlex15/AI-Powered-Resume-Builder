import { analyzeCV } from "../services/aiService";
import { callAIMLAPI } from "../utils/aimlapiClient";

jest.mock("../utils/aimlapiClient");

describe("AI Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("analyzeCV", () => {
    it("should return optimized CV text", async () => {
      const mockResponse = "Optimized CV text";
      (callAIMLAPI as jest.Mock).mockResolvedValueOnce(mockResponse);

      const cvText = "Original CV text";
      const result = await analyzeCV(cvText);

      expect(result).toBe(mockResponse);
      expect(callAIMLAPI).toHaveBeenCalledWith(expect.any(String));
    });

    it("should throw error when API call fails", async () => {
      const error = new Error("AIML API call failed");
      (callAIMLAPI as jest.Mock).mockRejectedValueOnce(error);
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const cvText = "Original CV text";
      await expect(analyzeCV(cvText)).rejects.toThrow("AIML API call failed");
      expect(callAIMLAPI).toHaveBeenCalledWith(expect.any(String));
      consoleSpy.mockRestore();
    });
  });
});
