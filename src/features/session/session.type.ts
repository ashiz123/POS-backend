import { Payload } from "../auth/interfaces/authInterface";
import {
  AuthBusinessPayload,
  AuthUserPayload,
  KioskTerminalPayload,
} from "../../jwt/jwtPayload";

export interface ISessionService {
  createSession(
    token: string,
    payload: AuthUserPayload | AuthBusinessPayload | KioskTerminalPayload,
    ttl?: number,
  ): Promise<void>;
  getSession(token: string): Promise<Payload | null>;
  deleteSession(token: string): Promise<void>;
  isActive(token: string): Promise<boolean>;
}
