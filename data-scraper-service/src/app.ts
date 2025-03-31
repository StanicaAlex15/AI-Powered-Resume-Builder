import express, { Request, Response } from "express";
import { scrapeAndSend } from "./controllers/scraperController";

const app = express();
app.use(express.json());

app.post("/scrape", (req: Request, res: Response) => {
  scrapeAndSend(req, res);
});

const port = 3002;
app.listen(port, () => {
  console.log(`Data Scraper Service listening on port ${port}`);
});
