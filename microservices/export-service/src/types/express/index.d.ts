// src/types/index.d.ts
import express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        // alte proprietăți, dacă vrei
      };
    }
  }
}
