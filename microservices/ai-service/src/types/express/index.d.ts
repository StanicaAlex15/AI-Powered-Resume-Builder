// src/types/express/index.d.ts
import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      userId: string;
      // poți adăuga și alte câmpuri gen: email, roles, etc.
    };
  }
}
