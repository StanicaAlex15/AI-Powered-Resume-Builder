import { startExportProcessing } from "./controllers/exportController";
import { connectToMongo } from "./utils/fileStorage";

const start = async () => {
  try {
    await connectToMongo();
    await startExportProcessing();
  } catch (error) {
    console.error("❌ Failed to start Export Service:", error);
  }
};

start();

const port = 3004;
console.log(`🚀 Export Service running on port ${port}`);
