import { Request, Response } from "express";
import { scrapeLinkedInProfile } from "../services/scraperService";
import { sendDataToAI } from "../rabbitmq/rabbitmqPublisher";

export const scrapeAndSend = async (req: Request, res: Response) => {
  try {
    const url = req.body.url;
    if (!url) {
      return res.status(400).send("Missing URL in request body");
    }
    const scrapedData = url;
    // const scrapedData = await scrapeLinkedInProfile(url);
    // if (!scrapedData || !scrapedData.skills.length) {
    //   return res.status(500).send("No valid data scraped");
    // }

    const dataToSend = JSON.stringify(scrapedData);
    await sendDataToAI(dataToSend);

    res.status(200).send("Data scraped and sent successfully");
  } catch (error) {
    console.error("Error in scrapeAndSend:", error);
    res.status(500).send("Internal Server Error");
  }
};
