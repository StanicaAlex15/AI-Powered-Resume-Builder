import express, { Request, Response } from "express";
import { reviewCV } from "../services/cv.service";

const router = express.Router();

export const reviewCVController = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const scrapedData = await reviewCV(userId);
    res.status(200).json(scrapedData);
  } catch (error) {
    console.error("Error scraping data:", error);
    res.status(500).json({
      error: "Error scraping data. Please try again later.",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

router.post("/", reviewCVController);

export default router;
