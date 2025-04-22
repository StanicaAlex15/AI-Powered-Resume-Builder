const mockPost = jest.fn();
const mockAxiosInstance = {
  post: mockPost,
  interceptors: { response: { use: jest.fn() } },
  defaults: { headers: {} },
};

jest.mock("axios", () => {
  const originalAxios = jest.requireActual("axios");
  return {
    ...originalAxios,
    create: jest.fn(() => mockAxiosInstance),
  };
});

jest.mock("axios-retry", () => jest.fn());

describe("callAIMLAPI", () => {
  const prompt = "Optimize this CV";
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    delete process.env.AIML_API_URL;
  });

  afterEach(() => {
    console.error = originalConsoleError;
    delete process.env.AIML_API_URL;
    jest.resetModules();
  });

  it("should return cleaned response from API", async () => {
    mockPost.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: "```markdown\nOptimized CV\n```",
            },
          },
        ],
      },
    });

    const { callAIMLAPI } = require("../utils/aimlapiClient");

    const result = await callAIMLAPI(prompt);

    expect(result).toBe("Optimized CV");
  });

  it("should throw error on API failure with response", async () => {
    const error = {
      response: {
        data: { error: "Invalid request" },
      },
      message: "Some error",
    };
    mockPost.mockRejectedValue(error);

    const { callAIMLAPI } = require("../utils/aimlapiClient");

    await expect(callAIMLAPI(prompt)).rejects.toThrow("AIML API call failed");
    expect(console.error).toHaveBeenCalledWith("AIML API call failed:", {
      error: "Invalid request",
    });
  });

  it("should throw error on API failure without response", async () => {
    const error = new Error("Network is down");
    mockPost.mockRejectedValue(error);

    const { callAIMLAPI } = require("../utils/aimlapiClient");

    await expect(callAIMLAPI(prompt)).rejects.toThrow("AIML API call failed");
    expect(console.error).toHaveBeenCalledWith(
      "AIML API call failed:",
      "Network is down"
    );
  });

  it("should use API_URL from environment variable", async () => {
    process.env.AIML_API_URL = "https://custom-api-url.com/v1/chat/completions";
    jest.resetModules();

    mockPost.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: "```markdown\nCustom API URL test\n```",
            },
          },
        ],
      },
    });

    const { callAIMLAPI } = require("../utils/aimlapiClient");

    const result = await callAIMLAPI(prompt);

    expect(result).toBe("Custom API URL test");
    expect(mockPost).toHaveBeenCalledWith(
      "https://custom-api-url.com/v1/chat/completions",
      expect.objectContaining({
        model: "gpt-4o",
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "user", content: prompt }),
        ]),
      })
    );
  });
});
