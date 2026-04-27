import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtService.js";
import { AUTH_TYPE } from "../features/auth/user.constant.js";
import { TERMINAL_SESSION_STATUS } from "../features/terminal/terminalSession/terminalSession.constant.js";
import { container } from "tsyringe";
import { ITerminalSessionDocument } from "../features/terminal/terminalSession/terminalSession.model.js";
import { Model } from "mongoose";
import { TOKENS } from "../config/tokens.js";

export const authHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  //validation

  const token = req.cookies.accessToken;

  const accessSecret = new TextEncoder().encode(process.env.ACCESS_SECRET);

  if (!token) {
    res.status(401).json({ message: "User not authorized, Token required" });
    return;
  }

  // const token = authHeader.split(" ")[1];
  // if (!token) throw new Error("No token provided");

  try {
    const payload = await verifyToken(token, accessSecret);
    console.log("payload", payload);

    const userContext: any = {
      //base context
      userId: payload.sub,
      email: payload.email,
      type: payload.type,
      role: payload.role,
    };

    //Logging out , checking the status active or inactive. if inactive, than end the session.
    if (payload.type === AUTH_TYPE.TERMINAL_ACCESS) {
      const terminalSssionModel = container.resolve<
        Model<ITerminalSessionDocument>
      >(TOKENS.TERMINAL_SESSION_MODEL);

      const activeSession = await terminalSssionModel
        .findOne({
          _id: payload.terminalSessionId,
          status: TERMINAL_SESSION_STATUS.ACTIVE,
          logout: null,
        })
        .lean();

      if (!activeSession) {
        res.status(401).json({
          message: "Terminal session is invalid or has been logged out.",
        });
        return;
      }

      userContext.businessId = payload.businessId;
      userContext.terminalId = payload.terminalId;
      userContext.terminalSessionId = payload.terminalSessionId;
    }

    req.user = userContext;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};
