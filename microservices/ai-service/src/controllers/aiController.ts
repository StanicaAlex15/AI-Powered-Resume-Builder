import { Request, Response } from "express";
import { processFile } from "../services/fileService";
import { analyzeCV } from "../services/aiService";
import { sendProcessedDataToExport } from "../rabbitmq/rabbitmqPublisher";
import { UploadedFile } from "express-fileupload";

export const processCV = async (req: Request, res: Response) => {
  try {
    if (!req.files || !req.files.cv) {
      return res.status(400).send("No file uploaded");
    }

    const cvFile = Array.isArray(req.files.cv) ? req.files.cv[0] : req.files.cv;

    const textContent = await processFile(cvFile as UploadedFile);
    const atsOptimizedResume = await analyzeCV(textContent);

    await sendProcessedDataToExport(atsOptimizedResume);

    res.status(200).json({ message: "Processing success!" });
  } catch (error) {
    console.error("Error processing CV:", error);
    res.status(500).send("Error processing CV");
  }
};
