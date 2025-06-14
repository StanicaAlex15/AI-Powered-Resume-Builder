import express from "express";
import fileUpload from "express-fileupload";
import { processCV } from "./controllers/aiController";
import cors from "cors";
import { verifyTokenMiddleware } from "./middleware/verifyToken.middleware";
import client from "prom-client";

const app = express();

const register = new client.Registry();
client.collectDefaultMetrics({ register });

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://happy-island-08f195603.6.azurestaticapps.net",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.disable("x-powered-by");
const port = 8083;

app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
    abortOnLimit: true,
    useTempFiles: false,
  })
);

app.post("/process-cv", verifyTokenMiddleware, processCV);

app.listen(port, () => {
  console.log(`AI Service listening on port ${port}`);
});
