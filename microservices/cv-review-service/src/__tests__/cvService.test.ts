import { reviewCV } from "../services/cv.service";

describe("CV Review Service", () => {
  describe("reviewCV", () => {
    it("should return valid review with score and feedback", async () => {
      const testUsers = ["user-123", "user-456", "user-789"];

      for (const userId of testUsers) {
        const result = await reviewCV(userId);

        expect(result).toEqual({
          score: expect.any(Number),
          feedback: expect.any(String),
        });

        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
        expect(result.feedback.length).toBeGreaterThan(0);
      }
    });

    it("should handle empty userId parameter", async () => {
      const result = await reviewCV(null);
      expect(result).toMatchObject({
        score: 85,
        feedback: "Great CV, but consider adding more projects.",
      });
    });
  });
});
