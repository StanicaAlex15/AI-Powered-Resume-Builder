// src/__tests__/fileService.test.ts
import { processFile } from "../services/fileService";
import mammoth from "mammoth";
import pdfParse from "pdf-parse"; // redenumit aici
import { UploadedFile } from "express-fileupload";

// 👇 mock explicite
jest.mock("mammoth");
jest.mock("pdf-parse", () => jest.fn());

describe("File Service", () => {
  describe("processFile", () => {
    it("should extract text from DOCX", async () => {
      const mockDocxText = "DOCX content";

      (mammoth.extractRawText as jest.Mock).mockResolvedValueOnce({
        value: mockDocxText,
      });

      const mockFile = {
        data: Buffer.from(""),
        mimetype:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      } as UploadedFile;

      const result = await processFile(mockFile);
      expect(result).toBe(mockDocxText);
    });

    it("should extract text from PDF", async () => {
      const mockPdfText = "PDF content";

      (pdfParse as jest.Mock).mockResolvedValueOnce({ text: mockPdfText });

      const mockFile = {
        data: Buffer.from(""),
        mimetype: "application/pdf",
      } as UploadedFile;

      const result = await processFile(mockFile);
      expect(result).toBe(mockPdfText);
    });

    it("should throw error for unsupported file type", async () => {
      const mockFile = {
        data: Buffer.from(""),
        mimetype: "image/png",
      } as UploadedFile;

      await expect(processFile(mockFile)).rejects.toThrow(
        "Unsupported file type"
      );
    });
  });
});
