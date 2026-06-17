import { Request, Response, NextFunction } from "express";
import { NotFoundError, UnauthorizedError } from "../errors/httpErrors";
import { verifyToken } from "../utils/jwtService";

export const kioskAuthHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const terminalUserAccessToken = req.cookies.t_u_access_token;

    // 1. If no access token, immediately return 401 so the frontend knows to refresh
    if (!terminalUserAccessToken) {
      throw new UnauthorizedError("Access token missing", "SESSION_EXPIRED");
    }

    const accessSecret = new TextEncoder().encode(process.env.ACCESS_SECRET);
    let payload;

    try {
      payload = await verifyToken(terminalUserAccessToken, accessSecret);
    } catch (jwtError) {
      // 2. Catch specific JWT expiration/tampering errors and return 401
      console.error("JWT Verification Failed:", jwtError);
      throw new UnauthorizedError(
        "Invalid or expired access token",
        "TOKEN_INVALID",
      );
    }

    // 3. Validate the payload claims
    if (!payload.sub || !payload.role) {
      throw new NotFoundError("User information missing in token");
    }

    if (!payload.terminalSessionId) {
      throw new NotFoundError("Terminal session identity missing in token");
    }

    // 4. Attach to the request object
    req.terminalUser = {
      userId: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      type: payload.type,
      terminalSessionId: payload.terminalSessionId,
    };

    next();
  } catch (error) {
    // 5. Ensure Express handles the error safely without crashing the thread
    next(error);
  }
};
