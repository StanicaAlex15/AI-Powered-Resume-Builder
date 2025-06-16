import { Router, Request, Response } from "express";
import { getUsers, createUser, deleteUser } from "../services/user.service";

const router = Router();

export const getUsersController = async (_req: Request, res: Response) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "An unknown error occurred";
    }
    res.status(500).json({ error: errorMessage });
  }
};

export const createUserController = async (req: Request, res: Response) => {
  try {
    const user = await createUser(req.body);
    res.json(user);
  } catch (error) {
    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "An unknown error occurred";
    }
    res.status(500).json({ error: errorMessage });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const response = await deleteUser(req.params.id);
    res.json(response);
  } catch (error) {
    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "User not found";
    }
    res.status(404).json({ error: errorMessage });
  }
};

router.get("/", getUsersController);
router.post("/", createUserController);
router.delete("/:id", deleteUserController);

export default router;
