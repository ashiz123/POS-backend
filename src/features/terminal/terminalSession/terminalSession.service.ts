import { inject, injectable } from "tsyringe";

import {
  ITerminalSessionRepository,
  ITerminalSessionService,
  TerminalContext,
} from "./terminalSession.type";

import { TerminalSessionType } from "./terminalSession.model";
import {
  ONE_DAY_SESSION,
  TERMINAL_SESSION_STATUS,
} from "./terminalSession.constant";
import { AUTH_TYPE } from "../../auth/user.constant";
import {
  IAuthRepository,
  IUserDocument,
  JwtPayload,
  Payload,
} from "../../auth/interfaces/authInterface";
import { TOKENS } from "../../../config/tokens";
import { SignInType, VerifyType } from "../../../utils/jwtService";
import { ISessionService } from "../../session/session.type";
import { ITerminalRepository } from "../terminal.interface";
import { TerminalLoginType } from "../terminal.model";
import { IUserRepository } from "../../users/user.type";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../../errors/httpErrors";
import { ComparePasswordFn } from "../../../utils/password";

@injectable()
export class TerminalSessionService implements ITerminalSessionService {
  private readonly accessSecret: Uint8Array;
  private readonly refreshSecret: Uint8Array;

  constructor(
    @inject(TOKENS.TERMINAL_REPOSITORY)
    private terminalRepository: ITerminalRepository,
    @inject(TOKENS.TERMINAL_SESSION_REPOSITORY)
    private terminalSessionRepository: ITerminalSessionRepository,
    @inject(TOKENS.USER_REPOSITORY) private userRepository: IUserRepository,
    @inject(TOKENS.AUTH_REPOSITORY) private authRepository: IAuthRepository,
    @inject(TOKENS.SESSION_SERVICE) private session: ISessionService,
    @inject(TOKENS.JWT_SIGN_IN)
    private jwtSignIn: SignInType,
    @inject(TOKENS.VERIFY_JWT) private jwtVerify: VerifyType,
    @inject(TOKENS.COMPARE_PASSWORD)
    private comparePassword: ComparePasswordFn,
  ) {
    this.accessSecret = new TextEncoder().encode(process.env.ACCESS_SECRET);
    this.refreshSecret = new TextEncoder().encode(process.env.REFRESH_SECRET);
  }

  async terminalLogin(
    email: string,
    password: string,
    deviceAccessToken: string,
  ): Promise<TerminalContext> {
    const user: IUserDocument | null =
      await this.authRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (!user.password || !user.is_verified) {
      throw new BadRequestError("User is not verified");
    }

    const isValid = await this.comparePassword(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const { terminalId, businessId } = await this.jwtVerify(
      deviceAccessToken,
      this.accessSecret,
    );

    if (!terminalId) {
      throw new NotFoundError("Terminal not found");
    }

    if (!businessId) {
      throw new NotFoundError("Business not found");
    }

    const terminalLoginData: TerminalLoginType = {
      email,
      password,
      terminalId,
      businessId,
    };

    const context =
      await this.userRepository.getAuthorizedContext(terminalLoginData);

    const data: TerminalSessionType = {
      terminalId: terminalId,
      assignId: context.userId.toString(),
      status: TERMINAL_SESSION_STATUS.ACTIVE,
      assignTime: new Date(),
    };

    const terminalSession =
      await this.terminalSessionRepository.createTerminalSession(data);

    const payload: Payload = {
      type: AUTH_TYPE.TERMINAL_ACCESS,
      sub: context.userId.toString(),
      email: context.email,
      name: context.name,
      terminalSessionId: terminalSession.id,
      role: context.role,
      businessId: businessId.toString(),
      terminalId: terminalId.toString(),
    };

    const sessionAccessToken: string = await this.jwtSignIn(
      payload,
      this.accessSecret,
      "10m",
    );
    const sessionRefreshToken: string = await this.jwtSignIn(
      payload,
      this.refreshSecret,
      "24h",
    );

    //Refresh token is stored in redis for future use, expire after 24h
    await this.session.createSession(
      sessionRefreshToken,
      payload,
      ONE_DAY_SESSION,
    ); //session for 1 day

    return {
      sessionAccessToken,
      sessionRefreshToken,
      user: {
        email: context.email,
        role: context.role,
      },
    };
  }

  async terminalLogout(terminalSessionId: string): Promise<boolean> {
    const closeSession =
      await this.terminalSessionRepository.closeTerminalSession(
        terminalSessionId,
      );

    if (closeSession?.status !== TERMINAL_SESSION_STATUS.INACTIVE) {
      return false;
    }

    return true;
  }

  async generateSessionToken(refreshSessionToken: string): Promise<string> {
    const verify: JwtPayload = await this.jwtVerify(
      refreshSessionToken,
      this.refreshSecret,
    );

    if (!verify) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const payload = await this.session.getSession(refreshSessionToken);

    if (!payload) {
      throw new UnauthorizedError("Authenticated user not found");
    }

    const newAccessToken = await this.jwtSignIn(
      payload,
      this.accessSecret,
      "10m",
    );

    return newAccessToken;
  }
}
