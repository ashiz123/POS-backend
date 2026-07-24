import { AccountType, AuthType, UserRole } from "../features/auth/auth.type";

export interface JwtPayload {
  sessionStatus?: string;
  role: UserRole;
}

export interface BasePayload {
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface AuthUserPayload extends BasePayload {
  sub: string;
  email: string;
  name?: string;
  type?: AuthType;
  accountType?: AccountType;
  isVerified: boolean;
}

export interface AuthBusinessData {
  businessId: string;
  status?: string;
  role: UserRole;
}

export interface KioskTerminalSessionData {
  terminalId?: string;
  terminalSessionId?: string;
}

export interface AuthBusinessPayload extends BasePayload {
  businessId: string;
  status: string;
  role: UserRole;
}

export interface KioskTerminalSessionPayload extends BasePayload {
  terminalId?: string;
  terminalSessionId?: string;
}

export interface KioskTerminalDevicePayload extends BasePayload {
  terminalId: string;
  businessId: string;
}
