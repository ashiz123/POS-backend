import type { ErrorRequestHandler } from "express";
import { z } from "zod";
import { isHttpError, isError, isZodError } from "../errors/guard.js";
import { Request, Response, NextFunction } from "express";
import { logger } from "./logHandler.js";

export interface HttpError extends Error {
  statusCode?: number;
  expose?: boolean;
}

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    if (isZodError(err)) {
      logger.error({
        event: "VALIDATION_ERROR",
        path:
          err.issues.map((issue) => issue.path).join(", ") +
          " field requires attention",
        message: err.message,
        date: new Date().toISOString(),
      });
      return res.status(400).json({
        error: "Validation Error",
        path: err.issues.map((issue) => issue.path) + " field is required",
        details: z.treeifyError(err),
      });
    }

    if (isHttpError(err)) {
      logger.error({
        event: "HTTP_ERROR",
        message: err.message,
        statusCode: err.statusCode,
        location: err.location,
        date: new Date().toISOString(),
      });
      const message = err.expose ? err.message : "something went wrong";
      return res
        .status(err.statusCode)
        .json({ error: message, code: err?.code });
    }

    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  } catch (e) {
    if (isError(e)) {
      console.log(e.message);
    } else {
      console.log("Unknown error:", e);
    }

    return res.status(500).json({ error: "Error handler failed" });
  }
};
