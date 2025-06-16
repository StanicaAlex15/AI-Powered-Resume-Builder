import { getUserCVs } from "../controllers/exportController";
import * as fileStorage from "../utils/fileStorage";
import { Request, Response } from "express";

jest.mock("../utils/fileStorage");

const mockRequest = (data: Partial<Request> = {}): Request => data as Request;
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("export controller", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns user cvs", async () => {
    const files = [
      {
        _id: "1",
        filename: "a.pdf",
        uploadDate: "d",
        length: 1,
        metadata: { userId: "u1", uuid: "x" },
      },
    ];
    (fileStorage.getAllPDFFilesByUserId as jest.Mock).mockResolvedValue(files);
    const req = mockRequest({ user: { userId: "u1" } });
    const res = mockResponse();

    await getUserCVs(req, res);

    expect(fileStorage.getAllPDFFilesByUserId).toHaveBeenCalledWith("u1");
    expect(res.json).toHaveBeenCalledWith([
      {
        id: "1",
        filename: "a.pdf",
        uploadDate: "d",
        length: 1,
        metadata: { userId: "u1", uuid: "x" },
      },
    ]);
  });

  it("returns 401 if userId missing", async () => {
    const req = mockRequest({});
    const res = mockResponse();

    await getUserCVs(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized: userId missing",
    });
  });

  it("handles errors", async () => {
    (fileStorage.getAllPDFFilesByUserId as jest.Mock).mockRejectedValue(
      new Error("bad")
    );
    const req = mockRequest({ user: { userId: "u1" } });
    const res = mockResponse();
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await getUserCVs(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(
      "❌ Error fetching PDFs for user:",
      expect.any(Error)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to fetch PDFs for user.",
    });
    consoleSpy.mockRestore();
  });
});
