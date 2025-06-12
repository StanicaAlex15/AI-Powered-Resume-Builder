import { Request, Response } from "express";
import { processFile } from "../services/fileService";
import { analyzeCV } from "../services/aiService";
import { sendProcessedDataToExport } from "../rabbitmq/rabbitmqPublisher";
import { UploadedFile } from "express-fileupload";

export const processCV = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: missing userId" });
      return;
    }

    if (!req.files?.cv) {
      res.status(400).send("No file uploaded");
      return;
    }

    const cvFile = Array.isArray(req.files.cv) ? req.files.cv[0] : req.files.cv;

    const textContent = await processFile(cvFile as UploadedFile);
    const atsOptimizedResume = await analyzeCV(textContent);

    const uuid = await sendProcessedDataToExport(atsOptimizedResume, userId);
    console.log(uuid);
    res.status(200).json({
      message: "Processing success!",
      uuid: uuid,
    });
  } catch (error) {
    console.error("Error processing CV:", error);
    res.status(500).send("Error processing CV");
  }
};
