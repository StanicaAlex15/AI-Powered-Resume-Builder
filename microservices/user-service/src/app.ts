import express from "express";
import userController from "./controllers/user.controller";
import { connectDB } from "./db/db";
import { verifyTokenMiddleware } from "./middleware/verifyToken.middleware";
import cors from "cors";
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
app.use(express.json());

app.use("/api/user", verifyTokenMiddleware, userController);

console.log("Connecting to database...");
connectDB()
  .then(() => {
    console.log("Database connected, application starting...");
    app.listen(8081, () => {
      console.log("User Service listening on port 8081");
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err);
  });
