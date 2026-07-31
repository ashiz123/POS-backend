import { Payload } from "../auth/interfaces/authInterface";
import { AuthBusinessPayload, AuthUserPayload } from "../../jwt/jwtPayload";

export interface ISessionService {
  createSession(
    token: string,
    payload: AuthBusinessPayload | AuthUserPayload | Payload,
    ttl?: number,
  ): Promise<void>;
  getSession(token: string): Promise<Payload | null>;
  deleteSession(token: string): Promise<void>;
  isActive(token: string): Promise<boolean>;
}
