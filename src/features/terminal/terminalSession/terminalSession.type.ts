import { TerminalLoginType } from "../terminal.model";
import { TERMINAL_SESSION_STATUS } from "./terminalSession.constant";
import {
  ITerminalSessionDocument,
  TerminalSessionType,
} from "./terminalSession.model";

export type TerminalSessionStatus =
  (typeof TERMINAL_SESSION_STATUS)[keyof typeof TERMINAL_SESSION_STATUS];

export type TerminalContext = {
  sessionAccessToken: string;
  sessionRefreshToken: string;
  user: {
    email: string;
    role: string;
  };
};

export interface ITerminalSessionService {
  terminalLogin(
    email: string,
    password: string,
    deviceAT: string,
  ): Promise<TerminalContext>;
  terminalLogout(terminalSessionId: string): Promise<boolean>;
  generateSessionToken(refreshSessionToken: string): Promise<string>;
}

export interface ITerminalSessionRepository {
  createTerminalSession(
    data: TerminalSessionType,
  ): Promise<ITerminalSessionDocument>;
  closeTerminalSession(
    terminalSessionId: string,
  ): Promise<ITerminalSessionDocument | null>;
}
