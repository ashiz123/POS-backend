import { Model } from "mongoose";
import { Response } from "express";
import { TOKENS } from "../config/tokens";
import { TERMINAL_SESSION_STATUS } from "../features/terminal/terminalSession/terminalSession.constant";
import { ITerminalSessionDocument } from "../features/terminal/terminalSession/terminalSession.model";
import { container } from "tsyringe";
import { JwtPayload } from "../features/auth/interfaces/authInterface";

export const terminalSession = async (res: Response, payload: JwtPayload) => {
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

  const businessId = payload.businessId;
  const terminalId = payload.terminalId;
  const terminalSessionId = payload.terminalSessionId;

  return { businessId, terminalId, terminalSessionId };
};
