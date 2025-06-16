import { Request, Response, NextFunction } from "express";

export const verifyTokenController = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({ message: "Token valid", user: req.user });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid token" });
  }
};
