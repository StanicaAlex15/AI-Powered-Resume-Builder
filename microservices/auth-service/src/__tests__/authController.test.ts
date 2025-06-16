import { verifyTokenController } from "../controllers/auth.controller";
import { Request, Response } from "express";

const mockRequest = (data: Partial<Request> = {}): Request => data as Request;
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("auth controller", () => {
  it("returns success with user", async () => {
    const req = mockRequest({ user: { userId: "1", email: "a@b.c" } });
    const res = mockResponse();

    await verifyTokenController(req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token valid",
      user: req.user,
    });
  });

  it("handles errors", async () => {
    const req = mockRequest();
    const res = mockResponse();
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    (res.status as jest.Mock).mockImplementationOnce(() => {
      throw new Error("fail");
    });

    await verifyTokenController(req, res, () => {});

    expect(consoleSpy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    consoleSpy.mockRestore();
  });
});
