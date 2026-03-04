import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (err instanceof mongoose.Error.ValidationError) {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    res.status(400).json({ error: message });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ error: "Invalid todo ID" });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
}
