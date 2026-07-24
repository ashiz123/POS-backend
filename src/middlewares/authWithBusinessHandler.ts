import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../jwt/jwtService";
import { logger } from "./logHandler";
import { AuthBusinessPayload } from "../jwt/jwtPayload";

export const authWithBusinessHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.cookies.businessToken; //Business token

  if (!req.user) {
    res.status(401).json({ message: "Unauthorized: Missing user context" });
    return;
  }

  const accessSecret = new TextEncoder().encode(process.env.ACCESS_SECRET);
  if (!token) throw new Error("No token provided");

  try {
    const payload = await verifyToken<AuthBusinessPayload>(token, accessSecret);

    if (!payload) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!payload.role) {
      res.status(401).json({ message: "Unauthorized: Missing user role" });
      return;
    }

    req.business = {
      status: payload.status,
      businessId: payload.businessId,
      role: payload.role,
    };

    next();
  } catch (error) {
    logger.info(error);
    console.log("error comes", error);
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
