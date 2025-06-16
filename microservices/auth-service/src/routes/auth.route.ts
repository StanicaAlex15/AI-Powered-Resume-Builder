import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { verifyTokenController } from "../controllers/auth.controller";
const router = Router();

router.post("/verify", verifyToken, verifyTokenController);

export default router;
