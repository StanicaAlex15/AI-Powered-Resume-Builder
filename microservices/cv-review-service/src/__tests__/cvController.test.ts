import { reviewCVController } from "../controllers/cv.controller";
import * as cvService from "../services/cv.service";
import { Request, Response } from "express";

jest.mock("../services/cv.service");

const mockRequest = (data: Partial<Request> = {}): Request => data as Request;
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("cv controller", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns reviewed CV", async () => {
    (cvService.reviewCV as jest.Mock).mockResolvedValue({ score: 90 });
    const req = mockRequest({ body: { userId: "1" } });
    const res = mockResponse();

    await reviewCVController(req, res);

    expect(cvService.reviewCV).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ score: 90 });
  });

  it("handles errors", async () => {
    (cvService.reviewCV as jest.Mock).mockRejectedValue(new Error("fail"));
    const req = mockRequest({ body: { userId: "1" } });
    const res = mockResponse();
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await reviewCVController(req, res);

    expect(consoleSpy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error scraping data. Please try again later.",
      message: "fail",
    });
    consoleSpy.mockRestore();
  });
});
