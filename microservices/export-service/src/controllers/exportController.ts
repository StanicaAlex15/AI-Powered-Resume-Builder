import { consumeProcessedData } from "../rabbitmq/rabbitmqConsumer";
import { Request, Response } from "express";
import { getAllPDFFilesByUserId } from "../utils/fileStorage";

export const startExportProcessing = async () => {
  try {
    await consumeProcessedData();
  } catch (error) {
    console.error("Error in Export Processing:", error);
  }
};

export const getUserCVs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized: userId missing" });
      return;
    }
    const files = await getAllPDFFilesByUserId(userId);

    res.json(
      files.map((file) => ({
        id: file._id.toString(),
        filename: file.filename,
        uploadDate: file.uploadDate,
        length: file.length,
        metadata: file.metadata,
      }))
    );
  } catch (error) {
    console.error("❌ Error fetching PDFs for user:", error);
    res.status(500).json({ error: "Failed to fetch PDFs for user." });
  }
};
