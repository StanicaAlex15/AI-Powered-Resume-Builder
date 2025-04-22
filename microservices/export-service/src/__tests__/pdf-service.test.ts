import { createPDF } from "../services/exportService";
import pdfkit from "pdfkit";

type MockPDFKit = {
  text: jest.Mock;
  end: jest.Mock;
  on: jest.Mock;
};

jest.mock("pdfkit");

describe("PDF Service", () => {
  describe("createPDF", () => {
    it("should create PDF buffer from text", async () => {
      const onMock = jest.fn();
      const textMock = jest.fn();
      const endMock = jest.fn();

      const mockDoc: MockPDFKit = {
        text: textMock,
        end: endMock,
        on: onMock,
      };

      (pdfkit as unknown as jest.Mock).mockImplementation(() => mockDoc);

      (onMock as jest.Mock).mockImplementation((event, handler) => {
        if (event === "data") {
          setTimeout(() => handler(Buffer.from("mock-chunk")), 0);
        }
        if (event === "end") {
          setTimeout(() => handler(), 0);
        }
        return mockDoc;
      });

      const result = await createPDF("test content");

      expect(result).toBeInstanceOf(Buffer);
      expect(textMock).toHaveBeenCalledWith("test content");
    });

    it("should handle PDF generation errors", async () => {
      const onMock = jest.fn();
      const textMock = jest.fn();
      const endMock = jest.fn();

      const mockDoc: MockPDFKit = {
        text: textMock,
        end: endMock,
        on: onMock,
      };

      (pdfkit as unknown as jest.Mock).mockImplementation(() => mockDoc);

      (onMock as jest.Mock).mockImplementation((event, handler) => {
        if (event === "error") {
          setTimeout(() => handler(new Error("PDF error")), 0);
        }
        return mockDoc;
      });

      await expect(createPDF("bad content")).rejects.toThrow("PDF error");
    });
  });

  it("should catch and rethrow errors thrown during PDF creation (before Promise)", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    (pdfkit as unknown as jest.Mock).mockImplementation(() => {
      throw new Error("constructor error");
    });

    await expect(createPDF("any data")).rejects.toThrow("constructor error");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "❌ Error creating PDF:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
