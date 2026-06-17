import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtService";
import { logger } from "./logHandler";

export const authWithBusinessHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.cookies.businessToken;
  console.log("business token", token);

  const accessSecret = new TextEncoder().encode(process.env.ACCESS_SECRET);
  if (!token) throw new Error("No token provided");

  try {
    const payload = await verifyToken(token, accessSecret);

    console.log("payload is here", payload);

    if (!payload) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!payload.role) {
      res.status(401).json({ message: "Unauthorized: Missing user role" });
      return;
    }

    req.user = {
      userId: payload.sub,
      email: payload.email,
      type: payload.type,
      accountType: payload.accountType,
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
