import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtService.js";
import { AUTH_TYPE } from "../features/auth/user.constant.js";
import { terminalSession } from "../utils/terminalSession.js";

type TerminalSessionType = {
  businessId: string;
  terminalId: string;
  terminalSessionId: string;
};

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

  try {
    const payload = await verifyToken(token, accessSecret);

    if (!payload.isVerified) {
      res.status(401).json({ message: "User is not verified" });
      return;
    }

    const userContext: any = {
      //base context
      userId: payload.sub,
      email: payload.email,
      type: payload.type,
      accountType: payload.accountType,
      isVerified: payload.isVerified,
    };

    //if its AUTH_TYPE is TERMINAL_ACCESS than, added some element on that UserContext object.
    if (payload.type === AUTH_TYPE.TERMINAL_ACCESS) {
      const { businessId, terminalId, terminalSessionId } = terminalSession(
        res,
        payload,
      ) as unknown as TerminalSessionType;
      // this is recently updated. Check this working
      userContext.businessId = businessId;
      userContext.terminalId = terminalId;
      userContext.terminalSessionId = terminalSessionId;
    }

    console.log("user context", userContext);
    req.user = userContext;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};
