import { ForbiddenError } from "../errors/httpErrors";
import { Request, Response, NextFunction } from "express";

export const isManager = (req: Request, res: Response, next: NextFunction) => {
  if (req.business?.role !== "manager") {
    return next(new ForbiddenError("User must be manager"));
  }

  next();
};
