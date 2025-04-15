import express from "express";
import fileUpload from "express-fileupload";
import { processCV } from "./controllers/aiController";

const app = express();
app.disable("x-powered-by");
const port = 3003;

app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
    abortOnLimit: true,
    useTempFiles: false,
  })
);

app.post("/process-cv", (req, res) => {
  processCV(req, res);
});

app.listen(port, () => {
  console.log(`AI Service listening on port ${port}`);
});
