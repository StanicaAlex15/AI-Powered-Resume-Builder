import { Request, Response } from "express";
import {
  getUsersController,
  createUserController,
  deleteUserController,
} from "../controllers/user.controller";
import * as userService from "../services/user.service";

jest.mock("../services/user.service");

const mockRequest = (data: Partial<Request> = {}): Request => {
  return data as Request;
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("User Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUsersController", () => {
    it("should respond with users", async () => {
      const users = [{ _id: "1", name: "Alice", email: "a@b.c" }];
      (userService.getUsers as jest.Mock).mockResolvedValue(users);
      const req = mockRequest();
      const res = mockResponse();

      await getUsersController(req, res);

      expect(userService.getUsers).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(users);
    });

    it("should handle errors", async () => {
      (userService.getUsers as jest.Mock).mockRejectedValue(new Error("fail"));
      const req = mockRequest();
      const res = mockResponse();

      await getUsersController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "fail" });
    });
    it("should fallback to default message when error is not an instance of Error", async () => {
      (userService.getUsers as jest.Mock).mockRejectedValue("not-an-error");

      const req = mockRequest();
      const res = mockResponse();

      await getUsersController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "An unknown error occurred",
      });
    });
  });

  describe("createUserController", () => {
    it("should create a user", async () => {
      const user = { _id: "2", name: "Bob", email: "b@c.d" };
      (userService.createUser as jest.Mock).mockResolvedValue(user);
      const req = mockRequest({ body: { name: "Bob", email: "b@c.d" } });
      const res = mockResponse();

      await createUserController(req, res);

      expect(userService.createUser).toHaveBeenCalledWith({
        name: "Bob",
        email: "b@c.d",
      });
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it("should handle errors", async () => {
      (userService.createUser as jest.Mock).mockRejectedValue(new Error("bad"));
      const req = mockRequest({ body: {} });
      const res = mockResponse();

      await createUserController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "bad" });
    });
  });

  describe("deleteUserController", () => {
    it("should delete a user", async () => {
      (userService.deleteUser as jest.Mock).mockResolvedValue({ ok: true });
      const req = mockRequest({ params: { id: "1" } });
      const res = mockResponse();

      await deleteUserController(req, res);

      expect(userService.deleteUser).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({ ok: true });
    });

    it("should handle errors", async () => {
      (userService.deleteUser as jest.Mock).mockRejectedValue(
        new Error("nope")
      );
      const req = mockRequest({ params: { id: "x" } });
      const res = mockResponse();

      await deleteUserController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "nope" });
    });
    it("should fallback to default message when error is not an instance of Error", async () => {
      (userService.deleteUser as jest.Mock).mockRejectedValue("not-an-error");
      const req = mockRequest({ params: { id: "999" } });
      const res = mockResponse();

      await deleteUserController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });
    it("should handle non-Error thrown values", async () => {
      (userService.deleteUser as jest.Mock).mockRejectedValue("fail as string");
      const req = mockRequest({ params: { id: "x" } });
      const res = mockResponse();

      await deleteUserController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });
    it("should fallback to default message when error is not an instance of Error", async () => {
      (userService.createUser as jest.Mock).mockRejectedValue("not-an-error");

      const req = mockRequest({
        body: { name: "Test", email: "test@test.com" },
      });
      const res = mockResponse();

      await createUserController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "An unknown error occurred",
      });
    });
  });
});
