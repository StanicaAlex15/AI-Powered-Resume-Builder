import express from "express";
import userController from "./controllers/user.controller";
import { connectDB } from "./db/db";
import { verifyTokenMiddleware } from "./middleware/verifyToken.middleware";
import cors from "cors";

const app = express();

const corsOptions = {
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/user", verifyTokenMiddleware, userController);

connectDB()
  .then(() => {
    console.log("Database connected, application starting...");
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
  });
app.listen(8081, () => {
  console.log("User Service listening on port 3001");
});
