import express from "express";
import { reviewCV } from "../services/cv.service";

const router = express.Router();

router.post("/", async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.body.userId;
    const scrapedData = await reviewCV(userId);
    res.status(200).json(scrapedData);
  } catch (error) {
    res.status(500).json({ error: "Error scraping data" });
  }
});

export default router;
