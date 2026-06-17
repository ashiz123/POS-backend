import { SignJWT, jwtVerify } from "jose";
import {
  Payload,
  JwtPayload,
} from "../features/auth/interfaces/authInterface.js";

import { PreAuthType } from "../features/auth/auth.type.js";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

if (!secret) {
  throw new Error("JWT secret is not set");
}

// export interface IClaims extends Omit<JWTPayload, 'sub'> {
//     sub: string
//     email: string
// }

export const ISSUER: string = "my-pos-auth";
export const AUDIENCE: string = "my-pos-api";

export type SignInType = (
  data: any, //its set to any for now
  secret: Uint8Array,
  ttl?: string,
) => Promise<string>;

export type VerifyType = (
  token: string,
  secret: Uint8Array,
) => Promise<JwtPayload>;

export type TerminalSignInType = (
  data: Payload | PreAuthType,
  ttl?: string,
) => Promise<string>;

export type GenerateTokenType = (payload: any) => Promise<string>;

export const signIn: SignInType = async (
  data,
  secret,
  ttl = "10m",
): Promise<string> => {
  return await new SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(ttl)
    .sign(secret);
};

export const verifyToken: VerifyType = async (
  token: string,
  secret: Uint8Array,
): Promise<JwtPayload> => {
  const { payload } = await jwtVerify<JwtPayload>(token, secret, {
    algorithms: ["HS256"],
    issuer: ISSUER,
    audience: AUDIENCE,
    clockTolerance: 5,
  });

  return payload;
};

// async function validateRefreshSession(token: string): Promise<void> {
//   const sessionService = container.resolve<ISessionService>(
//     TOKENS.SESSION_SERVICE,
//   );
//   const session = await sessionService.isActive(token);
//   console.log("testing session", session);

//   if (!session) {
//     throw new UnauthorizedError("Session is invalid or terminated");
//   }
// }
