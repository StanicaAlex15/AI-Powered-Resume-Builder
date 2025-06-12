import { Request, Response, NextFunction, Router } from "express";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();

router.post(
  "/verify",
  verifyToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({ message: "Token valid", user: req.user });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Invalid token" });
    }
  }
);

export default router;
