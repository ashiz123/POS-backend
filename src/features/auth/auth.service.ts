import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../errors/httpErrors.js";

import {
  IUserDocument,
  IAuthRepository,
  IAuthService,
  Payload,
  IUserProps,
} from "./interfaces/authInterface.js";
import { GenerateTokenType, SignInType } from "../../utils/jwtService.js";
import {
  LoginFirstResponse,
  LoginWithSelectBusinessDTO,
  PreAuthType,
  UserBusiness,
  type LoginResponse,
} from "./types/LoginResponse.type.js";
import {
  IUserBusinessDocument,
  IUserBusinessRepository,
} from "../userBusiness/interfaces/userBusiness.interface.js";
import { inject, singleton } from "tsyringe";
import { TOKENS } from "../../config/tokens.js";
import { ISessionService } from "../session/session.type.js";
import { ComparePasswordFn } from "../../utils/password.js";
import { IInternalNotificationEmitter } from "../../core/notification.emitter.js";
import { ICryptoService } from "../../utils/token.js";
import { IAuthCode, IAuthCodeRepository } from "../authCode/authCode.type.js";

@singleton()
export class AuthService implements IAuthService {
  private readonly accessSecret: Uint8Array;
  private readonly refreshSecret: Uint8Array;

  constructor(
    @inject(TOKENS.AUTH_REPOSITORY) private authRepository: IAuthRepository,
    @inject(TOKENS.SESSION_SERVICE) private session: ISessionService,
    @inject(TOKENS.USER_BUSINESS_REPOSITORY)
    private userBusinessRepository: IUserBusinessRepository,
    @inject(TOKENS.NOTIFICATION_EMITTER)
    private notificationEmitter: IInternalNotificationEmitter,
    @inject(TOKENS.AUTHCODE_REPOSITORY)
    private authCodeRepository: IAuthCodeRepository,
    @inject(TOKENS.COMPARE_PASSWORD)
    private comparePassword: ComparePasswordFn,
    @inject(TOKENS.JWT_SIGN_IN)
    private jwtSignIn: SignInType,
    @inject(TOKENS.GENERATE_TOKEN)
    private generateToken: GenerateTokenType,
    @inject(TOKENS.CRYPTO_SERVICE)
    private cryptoService: ICryptoService,
  ) {
    this.accessSecret = new TextEncoder().encode(process.env.ACCESS_SECRET);
    this.refreshSecret = new TextEncoder().encode(process.env.REFRESH_SECRET);
  }

  async register(data: IUserProps): Promise<IUserDocument> {
    const token = this.cryptoService.createToken();

    const user: IUserDocument | null = await this.authRepository.findByEmail(
      data.email,
    );

    if (user) {
      throw new ConflictError("User already exist", "authService.registerUser");
    }

    const newUserWithToken: IUserProps = {
      ...data,
      verificationToken: this.cryptoService.hashToken(token),
      verificationExpires: new Date(Date.now() + 3600000),
    };

    const newUser = await this.authRepository.createUser(newUserWithToken);
    if (newUser) {
      const emailData = {
        email: newUser.email,
        subject: "Access Code",
        message: `Verify your account : http://localhost:3000/api/auth/verifyUser/${token}`,
      };
      this.notificationEmitter.notify(emailData);
    }

    return newUser;
  }

  async verify(token: string): Promise<IUserDocument> {
    if (!token) {
      throw new NotFoundError("token not found");
    }
    const hashedToken = this.cryptoService.hashToken(token);
    return this.authRepository.verifyUser(hashedToken);
  }

  async login(
    email: string,
    password: string,
  ): Promise<IUserDocument | LoginFirstResponse> {
    const user: IUserDocument | null =
      await this.authRepository.findByEmail(email);

    console.log("app secret", process.env.NODE_ENV);
    if (!user) {
      throw new NotFoundError("User not registered", "authService.loginUser");
    }

    if (!user.password) {
      throw new UnauthorizedError("User is not activated yet");
    }

    const isValid = await this.comparePassword(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (!user.is_verified) {
      throw new UnauthorizedError("User is not verified");
    }

    // Added this for admin
    if (user.role === "admin") {
      const accessCode = await this.adminLogin(user);

      if (!accessCode) {
        throw new NotFoundError("Access code not found");
      }

      return {
        role: "admin",
        email: user.email,
        otp: accessCode,
      };
    }

    const preAuthData: PreAuthType = {
      sub: user.id,
      email: user.email,
      type: "preAuth",
    };

    const accessToken = await this.jwtSignIn(
      preAuthData,
      this.accessSecret,
      "15m",
    );
    const refreshToken = await this.jwtSignIn(
      preAuthData,
      this.refreshSecret,
      "7h",
    );

    return {
      userData: user,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async loginWithSelectBusiness(
    data: LoginWithSelectBusinessDTO,
  ): Promise<LoginResponse> {
    const userBusiness: IUserBusinessDocument | null =
      await this.userBusinessRepository.getUserBusiness(
        data.userId,
        data.businessId,
      );

    if (!userBusiness) {
      throw new NotFoundError(
        "User has no businesses, You are not authorized to login",
        "authService.loginUser",
      );
    }

    const payload: Payload = {
      sub: data.userId,
      email: data.email,
      role: userBusiness.role,
      status: userBusiness.userStatus,
      businessId: data.businessId,
      type: "access",
    };

    const token = await this.generateToken(payload);
    await this.session.createSession(token, payload);

    return {
      email: data.email,
      token: token,
    };
  }

  async logout(token: string): Promise<boolean> {
    await this.session.deleteSession(token);
    return true;
  }

  async adminLogin(user: IUserDocument): Promise<string | null> {
    const accessCode = this.cryptoService.generateActivationCode();
    const hashedToken = this.cryptoService.hashToken(accessCode);

    const authCodeData: IAuthCode = {
      email: user.email,
      code: hashedToken,
      expiresAt: new Date(Date.now() + 5 * 60000),
    };

    await this.authCodeRepository.create(authCodeData);

    const emailData = {
      email: user.email,
      subject: "Access Code",
      message: `Enter this access${accessCode} code  to authorize fully`,
    };
    this.notificationEmitter.notify(emailData);
    return null;
  }

  async adminVerifyToken(email: string, otp: string): Promise<string> {
    const authRecord = await this.authCodeRepository.getByEmail(email);

    if (!authRecord) {
      throw new Error("Invalid access code or it has expired");
    }

    const isMatch = await this.comparePassword(otp, authRecord.code);

    if (!isMatch) {
      throw new Error("Invalid access code");
    }

    await this.authCodeRepository.delete(authRecord.id);

    const adminData = {
      email: authRecord.email,
      role: "admin",
      type: "access",
    };

    const token = await this.generateToken(adminData);
    return token;
  }

  async setRefreshToken(refreshToken: string): Promise<string> {}

  // async createSession(token: string, payload: Payload) {
  //     await this.redis.set(
  //         `session:${token}`,
  //         JSON.stringify(payload),
  //         'EX',
  //         3600
  //     )
  //     return
  // }

  // async getSessionToken(token: string): Promise<Payload> {
  //     const session = await this.redis.get(`session:${token}`)
  //     if (!session) {
  //         throw new NotFoundError('Session not found')
  //     }
  //     return JSON.parse(session) as Payload
  // }
}
