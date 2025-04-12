import express from "express";
import userController from "./controllers/user.controller";
import { connectDB } from "./db/db";

const app = express();
app.use(express.json());

app.use("/api/user", userController);

connectDB()
  .then(() => {
    console.log("Database connected, application starting...");
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
  });
app.listen(3001, () => {
  console.log("User Service listening on port 3001");
});
