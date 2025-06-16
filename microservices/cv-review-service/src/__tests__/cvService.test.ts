import { reviewCV } from "../services/cv.service";

describe("reviewCV service", () => {
  it("should return score and feedback for given userId", async () => {
    const userId = "123abc";
    const result = await reviewCV(userId);

    expect(result).toEqual({
      score: 85,
      feedback: "Great CV, but consider adding more projects.",
    });
  });
});
