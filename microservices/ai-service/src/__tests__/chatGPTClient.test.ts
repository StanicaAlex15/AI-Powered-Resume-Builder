import { getApiClient, callChatGPT } from "../utils/chatGPTClient";
import axios from "axios";
import axiosRetry from "axios-retry";

// Mocks
jest.mock("axios");
jest.mock("axios-retry");

const mockPost = jest.fn();
const mockCreate = axios.create as jest.Mock;

describe("chatGPTClient", () => {
  const mockResponse = {
    data: {
      choices: [
        {
          message: {
            content: "```markdown\nOptimized content\n```",
          },
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreate.mockReturnValue({
      post: mockPost,
    });
  });

  describe("getApiClient", () => {
    it("should create and return a new axios instance with retries", () => {
      const client = getApiClient();
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 300000,
          headers: expect.objectContaining({
            Authorization: expect.stringContaining("Bearer "),
          }),
        })
      );
      expect(axiosRetry).toHaveBeenCalled();
      expect(client).toHaveProperty("post");
    });

    it("should return the same instance on subsequent calls", () => {
      const client1 = getApiClient();
      const client2 = getApiClient();
      expect(client1).toBe(client2);
    });
  });

  describe("callChatGPT", () => {
    it("should return cleaned response from OpenAI", async () => {
      mockPost.mockResolvedValueOnce(mockResponse);

      const result = await callChatGPT("Optimize my CV");

      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining("chat/completions"),
        expect.objectContaining({
          model: "gpt-4o",
          messages: expect.any(Array),
        })
      );

      expect(result).toBe("Optimized content");
    });

    it("should throw a detailed error when OpenAI call fails", async () => {
      const error = {
        message: "Request failed",
        stack: "stacktrace",
        response: {
          status: 429,
          data: { error: "rate limit" },
        },
      };
      mockPost.mockRejectedValueOnce(error);

      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      await expect(callChatGPT("bad")).rejects.toThrow(
        "OpenAI API call failed with status: 429"
      );

      expect(spy).toHaveBeenCalledWith(
        "OpenAI API call failed:",
        expect.objectContaining({
          message: "Request failed",
          statusCode: 429,
        })
      );

      spy.mockRestore();
    });
  });
});
