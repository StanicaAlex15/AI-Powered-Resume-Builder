import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import { startAuthConsumer } from "./services/rabbitmq";
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

app.use("/auth", authRoutes);

const PORT = 8082;

app.listen(PORT, () => {
  console.log(`✅ Auth Service listening on port ${PORT}`);
  startAuthConsumer();
});
