import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../errors/httpErrors";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.business?.role !== "admin") {
    return next(new ForbiddenError("User must be admin"));
  }

  next();
};
