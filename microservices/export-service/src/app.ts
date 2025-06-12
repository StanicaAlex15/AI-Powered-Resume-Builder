import express from "express";
import { connectDB } from "./db/db";
import {
  initializeGridFS,
  getPDFStreamFromMongoByUuid,
} from "./utils/fileStorage";
import { startExportProcessing } from "./controllers/exportController";
import { verifyTokenMiddleware } from "./middleware/verifyToken.middleware";
import { getUserCVs } from "./controllers/exportController";
import cors from "cors";

const app = express();
const corsOptions = {
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.disable("x-powered-by");
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

const port = 8084;
app.listen(port, () => {
  console.log(`🚀 Export Service running on port ${port}`);
});

app.get("/export/cv/:uuid", async (req, res) => {
  console.time("Total Request Time");
  try {
    const uuid = req.params.uuid;
    console.time("Stream PDF Time");
    const stream = await getPDFStreamFromMongoByUuid(uuid);
    console.timeEnd("Stream PDF Time");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=cv_export.pdf");

    stream.pipe(res);
  } catch (error) {
    console.error("❌ Error fetching PDF from MongoDB:", error);
    res.status(500).json({ error: "PDF not found or failed to retrieve." });
  }
  console.timeEnd("Total Request Time");
});

app.get("/export/cvs/user", verifyTokenMiddleware, getUserCVs);
