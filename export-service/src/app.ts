import { startExportProcessing } from "./controllers/exportController";

startExportProcessing();

const port = 3004;
console.log(`Export Service listening on port ${port}`);
