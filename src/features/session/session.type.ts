import { Payload } from "../auth/interfaces/authInterface";

export interface ISessionService {
  createSession(token: string, payload: Payload, ttl?: number): Promise<void>;
  getSession(token: string): Promise<Payload | null>;
  deleteSession(token: string): Promise<void>;
  isActive(token: string): Promise<boolean>;
}
