import { processCV } from "../controllers/aiController";
import { processFile } from "../services/fileService";
import { analyzeCV } from "../services/aiService";
import { sendProcessedDataToExport } from "../rabbitmq/rabbitmqPublisher";
import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";

jest.mock("../services/fileService");
jest.mock("../services/aiService");
jest.mock("../rabbitmq/rabbitmqPublisher");

const mockRequest = (data: Partial<Request> = {}): Request => data as Request;
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockFile: UploadedFile = {
  data: Buffer.from(""),
  mimetype: "application/pdf",
} as UploadedFile;

describe("AI Controller", () => {
  afterEach(() => jest.clearAllMocks());

  it("processes CV and sends to export", async () => {
    (processFile as jest.Mock).mockResolvedValue("text");
    (analyzeCV as jest.Mock).mockResolvedValue("optimized");
    (sendProcessedDataToExport as jest.Mock).mockResolvedValue("uuid");

    const req = mockRequest({ user: { userId: "1" }, files: { cv: mockFile } });
    const res = mockResponse();

    await processCV(req, res);

    expect(processFile).toHaveBeenCalledWith(mockFile);
    expect(analyzeCV).toHaveBeenCalledWith("text");
    expect(sendProcessedDataToExport).toHaveBeenCalledWith("optimized", "1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Processing success!",
      uuid: "uuid",
    });
  });

  it("returns 401 when userId missing", async () => {
    const req = mockRequest({ files: { cv: mockFile } });
    const res = mockResponse();

    await processCV(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized: missing userId",
    });
  });

  it("returns 400 when file missing", async () => {
    const req = mockRequest({ user: { userId: "1" } });
    const res = mockResponse();

    await processCV(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("No file uploaded");
  });

  it("handles processing errors", async () => {
    (processFile as jest.Mock).mockRejectedValue(new Error("bad"));
    const req = mockRequest({ user: { userId: "1" }, files: { cv: mockFile } });
    const res = mockResponse();

    await processCV(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Error processing CV");
  });
});
