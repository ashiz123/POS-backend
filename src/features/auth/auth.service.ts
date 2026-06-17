import {
  BadRequestError,
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
  JwtPayload,
} from "./interfaces/authInterface.js";
import { SignInType, VerifyType } from "../../utils/jwtService.js";

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
import {
  LoginResponse,
  LoginWithSelectBusinessDTO,
  PreAuthPayload,
  SelectBusinessResponse,
} from "./auth.type.js";
import { ACCOUNT_TYPE, AUTH_TYPE, sevenHourInSecond } from "./user.constant.js";

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
    @inject(TOKENS.VERIFY_JWT)
    private jwtVerify: VerifyType,
    @inject(TOKENS.CRYPTO_SERVICE)
    private cryptoService: ICryptoService,
  ) {
    if (!process.env.ACCESS_SECRET) {
      throw new Error("FATAL: ACCESS_SECRET is not defined in .env");
    }

    if (!process.env.REFRESH_SECRET) {
      throw new Error("FATAL: REFRESH_SECRET is not defined in .env");
    }

    this.accessSecret = new TextEncoder().encode(process.env.ACCESS_SECRET);
    this.refreshSecret = new TextEncoder().encode(process.env.REFRESH_SECRET);
  }

  async registerUser(data: IUserProps): Promise<IUserDocument> {
    const token = this.cryptoService.createToken();

    const user: IUserDocument | null = await this.authRepository.findByEmail(
      data.email,
    );

    if (user) {
      throw new ConflictError("User already exist", "authService.registerUser");
    }

    const newUserWithToken: IUserProps = {
      ...data,
      accountType: ACCOUNT_TYPE.BUSINESS,
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

  //Email verification after registeration
  async verifyRegister(token: string): Promise<IUserDocument> {
    if (!token) {
      throw new NotFoundError("token not found");
    }
    const hashedToken = this.cryptoService.hashToken(token);
    return this.authRepository.verifyUser(hashedToken);
  }

  async generatePreAuthToken(email: string, password: string): Promise<string> {
    const accessCode = this.cryptoService.generateActivationCode();
    const hashedToken = this.cryptoService.hashToken(accessCode);

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

    const authCodeData: IAuthCode = {
      email: user.email,
      code: hashedToken,
      expiresAt: new Date(Date.now() + 5 * 60000),
    };

    const authCode = await this.authCodeRepository.create(authCodeData);
    console.log("auth code", authCode);
    if (authCode) {
      const emailData = {
        email: user.email,
        subject: "Access Code",
        message: `Enter this access ${accessCode} code  to authorize fully`,
      };
      console.log(emailData);
      // this.notificationEmitter.notify(emailData); //TURNED OFF:to email code to user
    }

    const payload: PreAuthPayload = {
      sub: user.id,
      email: user.email,
      type: AUTH_TYPE.PREAUTH,
      accountType: user.accountType,
      isVerified: user.is_verified,
    };

    //it return preAuth Token
    return await this.jwtSignIn(payload, this.accessSecret, "5m");
  }

  async generateAccessToken(
    preAuthToken: string,
    otp: string,
  ): Promise<LoginResponse> {
    const { sub, email, accountType } = await this.jwtVerify(
      preAuthToken,
      this.accessSecret,
    );

    const hashedOtp = this.cryptoService.hashToken(otp);
    const authUser = await this.authCodeRepository.getByEmail(email, hashedOtp);

    if (!authUser) {
      throw new UnauthorizedError("User not found");
    }

    await this.authCodeRepository.delete(authUser.id);

    const authData = {
      sub: sub,
      email: authUser.email,
      accountType: accountType,
      type: AUTH_TYPE.APP_ACCESS,
      isVerified: true,
    } as unknown as PreAuthPayload;

    const accessToken = await this.jwtSignIn(authData, this.accessSecret, "1m");
    const refreshToken = await this.jwtSignIn(
      authData,
      this.refreshSecret,
      "7h",
    );

    await this.session.createSession(refreshToken, authData, sevenHourInSecond); //changed to refreshToken strogin

    return {
      accessToken,
      refreshToken,
      authData,
    };
  }

  async selectBusiness(
    data: LoginWithSelectBusinessDTO,
  ): Promise<SelectBusinessResponse> {
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

    const businessToken = await this.jwtSignIn(
      payload,
      this.accessSecret,
      "5h",
    ); //business
    await this.session.createSession(businessToken, payload);

    return {
      email: data.email,
      token: businessToken,
    };
  }

  async logout(token: string): Promise<boolean> {
    await this.session.deleteSession(token);
    return true;
  }

  async generateNewAccessToken(refreshToken: string): Promise<string> {
    const verify: JwtPayload = await this.jwtVerify(
      refreshToken,
      this.refreshSecret,
    );

    if (!verify) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const payload = await this.session.getSession(refreshToken);

    if (!payload) {
      throw new UnauthorizedError("Authenticated user not found");
    }

    const newAccessToken = await this.jwtSignIn(
      payload,
      this.accessSecret,
      "1m",
    );

    //check this line
    // await this.session.createSession(newAccessToken, payload);

    return newAccessToken;
  }
}
