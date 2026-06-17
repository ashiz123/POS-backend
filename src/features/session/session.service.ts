import { injectable, inject } from "tsyringe";
import { Payload } from "../auth/interfaces/authInterface";
import { ISessionService } from "./session.type";
import { TOKENS } from "../../config/tokens";
import Redis from "ioredis";
import { NotFoundError } from "../../errors/httpErrors";

@injectable()
export class SessionService implements ISessionService {
  constructor(@inject(TOKENS.REDIS_CONNECT) private redis: Redis) {}

  async createSession(
    token: string,
    payload: Payload,
    ttl: number = 3600,
  ): Promise<void> {
    await this.redis.set(
      `session:${token}`,
      JSON.stringify(payload),
      "EX",
      ttl, //1 hour
    );
    return;
  }

  async getSession(token: string): Promise<Payload> {
    const session = await this.redis.get(`session:${token}`);
    if (!session) {
      throw new NotFoundError("Session is expired or not found");
    }
    return JSON.parse(session) as Payload;
  }

  async deleteSession(token: string): Promise<void> {
    await this.redis.del(`session:${token}`);
  }

  async isActive(token: string): Promise<boolean> {
    const key = `session:${token}`;
    const exists = await this.redis.exists(key);
    if (!exists) {
      return false;
    }
    return true;
  }
}
