import { Router } from "express";
import { getUsers, createUser, deleteUser } from "../services/user.service";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ error: errorMessage });
  }
});

router.post("/", async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.json(user);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const response = await deleteUser(req.params.id);
    res.json(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "User not found";
    res.status(404).json({ error: errorMessage });
  }
});

export default router;
