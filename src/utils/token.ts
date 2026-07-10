import crypto from "crypto";
import { singleton } from "tsyringe";

export interface ICryptoService {
  createToken(): string;
  hashToken(token: string): string;
  generateActivationCode(): string;
}

@singleton()
export class CryptoService implements ICryptoService {
  createToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  generateActivationCode(): string {
    const code = crypto.randomInt(100000, 1000000);
    return code.toString();
  }
}
