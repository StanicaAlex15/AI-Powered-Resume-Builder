import express from "express";
import { connectDB } from "./db/db";
import { initializeGridFS, getPDFStreamFromMongo } from "./utils/fileStorage";
import { startExportProcessing } from "./controllers/exportController";

const app = express();
const startApp = async () => {
  try {
    await connectDB();
    await initializeGridFS();
    await startExportProcessing();
  } catch (error) {
    console.error("❌ Failed to start the application:", error);
  }
};

startApp();

const port = process.env.PORT ?? 3004;
app.listen(port, () => {
  console.log(`🚀 Export Service running on port ${port}`);
});

app.get("/export/cv/:fileId", async (req, res) => {
  console.time("Total Request Time");
  try {
    const fileId = req.params.fileId;
    console.time("Stream PDF Time");
    const stream = await getPDFStreamFromMongo(fileId);
    console.timeEnd("Stream PDF Time");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=cv_export.pdf");

    stream.pipe(res);
  } catch (error) {
    console.error("❌ Error fetching PDF from MongoDB:", error);
    res.status(500).json({ error: "PDF not found or failed to retrieve." });
  }
  console.timeEnd("Total Request Time");
});
