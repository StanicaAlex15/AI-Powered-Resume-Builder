import express from "express";
import cvRoutes from "./controllers/cv.controller";

const app = express();
app.use(express.json());
app.use("/cv-review", cvRoutes);

const PORT = 3005;
app.listen(PORT, () => {
  console.log(`CV Review Service running on port ${PORT}`);
});
