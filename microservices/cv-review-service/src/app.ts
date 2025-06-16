import express from "express";
import cvRoutes from "./controllers/cv.controller";
import cors from "cors";

const app = express();
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
app.use("/cv-review", cvRoutes);

const PORT = 8085;
app.listen(PORT, () => {
  console.log(`CV Review Service running on port ${PORT}`);
});
