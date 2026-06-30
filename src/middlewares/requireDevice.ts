import { Request, Response, NextFunction } from "express";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/httpErrors";
import { verifyToken } from "../utils/jwtService";

export const requireDevice = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // const deviceRefreshToken = req.cookies.deviceR_token;

  // if (!deviceRefreshToken) {
  //   throw new ForbiddenError("Session is expired");
  // }

  const deviceAccessToken = req.cookies.deviceA_token;

  if (!deviceAccessToken) {
    console.log("Device access token not found");
    throw new UnauthorizedError("Invalid or expired token", "DEVICE_EXPIRED");
  }

  const accessSecret = new TextEncoder().encode(process.env.ACCESS_SECRET);

  try {
    const payload = await verifyToken(deviceAccessToken, accessSecret);

    if (!payload.businessId || !payload.terminalId) {
      throw new NotFoundError(
        "BusinessId and TerminalId is required for terminal",
      );
    }

    const terminalData = {
      businessId: payload.businessId,
      terminalId: payload.terminalId,
    };

    req.terminal = terminalData;
    next();
  } catch (error) {
    console.log(error);
    throw new ConflictError("Something went wrong with device middleware");
  }
};
