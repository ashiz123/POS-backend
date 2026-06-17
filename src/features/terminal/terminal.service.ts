import { Connection } from "mongoose";
import { TOKENS } from "../../config/tokens";
import {
  ONE_YEAR_IN_SECONDS,
  TERMINAL_PAYMENT_STATUS,
  TERMINAL_STATUS,
} from "./terminal.constant";
import {
  ApproveTerminal,
  ApproveTerminalData,
  CreateTerminal,
  TerminalDetail,
  TerminalDocument,
  TerminalType,
} from "./terminal.model";

import { injectable, inject } from "tsyringe";
import { Queue } from "bullmq";
import { ICryptoService } from "../../utils/token";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../errors/httpErrors";
import { SignInType, VerifyType } from "../../utils/jwtService";
import { ITerminalRepository, ITerminalService } from "./terminal.interface";
import { JwtPayload, Payload } from "../auth/interfaces/authInterface";
import { ISessionService } from "../session/session.type";

@injectable()
export class TerminalService implements ITerminalService {
  private readonly accessSecret: Uint8Array;
  private readonly refreshSecret: Uint8Array;

  constructor(
    @inject(TOKENS.DATABASE_CONNECTION)
    private readonly connection: Connection,
    @inject(TOKENS.TERMINAL_REPOSITORY)
    private readonly terminalRepository: ITerminalRepository,
    @inject(TOKENS.NOTIFICATION_ADMIN_QUEUE)
    private readonly notificationAdminQueue: Queue,
    @inject(TOKENS.NOTIFICATION_OWNER_QUEUE)
    private readonly notificationOwnerQueue: Queue,
    @inject(TOKENS.CRYPTO_SERVICE)
    private readonly cryptoService: ICryptoService,
    @inject(TOKENS.JWT_SIGN_IN)
    private jwtSignIn: SignInType,
    @inject(TOKENS.VERIFY_JWT)
    private jwtVerify: VerifyType,
    @inject(TOKENS.SESSION_SERVICE) private session: ISessionService,
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

  async createTerminal(data: CreateTerminal): Promise<TerminalDocument> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const terminalData: TerminalType = {
        ownerId: data.ownerId,
        businessId: data.businessId,
        name: data.name,
        status: TERMINAL_STATUS.REQUESTED,
        paymentStatus: TERMINAL_PAYMENT_STATUS.PENDING,
        activationStatus: false,
      };

      const newTerminal = await this.terminalRepository.createWithSession(
        terminalData,
        session,
      );

      // await this.adminRequestService.createWithSession(adminData, session)

      //send email using queue
      await this.notificationAdminQueue.add(
        "Create-terminal",
        {
          terminalId: newTerminal.id, //job to activate terminal
          ownerId: newTerminal.ownerId, //who requested
          businessId: newTerminal.businessId, //what business
        },
        {
          delay: 1 * 60 * 1000,
          attempts: 3,
          removeOnComplete: true,
        },
      );

      await session.commitTransaction();

      return newTerminal;
    } catch (error) {
      await session.abortTransaction();
      console.error("Transaction aborted due to error:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  // async findByBusinessId(businessId: string): Promise<TerminalType[]> {}

  async approveTerminal(data: any): Promise<boolean> {
    const token = this.cryptoService.generateActivationCode();
    const approveDTO: ApproveTerminal = {
      businessId: data.businessId,
      terminalId: data.terminalId,
      approvedBy: data.email,
      status: TERMINAL_STATUS.APPROVED,
      activationCode: this.cryptoService.hashToken(token),
      approvedAt: new Date(),
    };

    const terminalApproved =
      await this.terminalRepository.changeTerminalStatus(approveDTO);

    if (!terminalApproved) {
      throw new BadRequestError(
        "Could not approve terminal. It might not exist or is not pending.",
      );
    }

    this.notificationOwnerQueue.add(
      "Approve-Terminal",
      {
        terminalId: terminalApproved.id,
        businessId: terminalApproved.businessId,
        ownerId: terminalApproved.ownerId,
        token,
      },
      {
        attempts: 3,
        removeOnComplete: true,
      },
    );

    return true;
  }

  async activateTerminal(activationCode: string): Promise<ApproveTerminalData> {
    const hashedActivationCode = this.cryptoService.hashToken(activationCode);

    const terminal =
      await this.terminalRepository.getTerminalByActivationCodeAndUpdate(
        hashedActivationCode,
      );

    if (!terminal) {
      throw new BadRequestError("Terminal cannot be acitvated ");
    }

    const terminalPayload = {
      terminalId: terminal.id.toString(),
      businessId: terminal.businessId.toString(),
    } as Payload;

    const deviceAccessToken = await this.jwtSignIn(
      terminalPayload,
      this.accessSecret,
      "3m",
    );

    const deviceRefreshToken = await this.jwtSignIn(
      terminalPayload,
      this.refreshSecret,
      "1y",
    );

    this.session.createSession(
      deviceRefreshToken,
      terminalPayload,
      ONE_YEAR_IN_SECONDS,
    );

    this.notificationOwnerQueue.add(
      "Activate-Terminal",
      {
        terminalId: terminal.id,
        businessId: terminal.businessId,
        ownerId: terminal.ownerId,
      },
      {
        delay: 1 * 60 * 1000,
        attempts: 3,
        removeOnComplete: true,
      },
    );

    return {
      deviceAccessToken,
      deviceRefreshToken,
    };
  }

  async findByBusinessId(businessId: string): Promise<TerminalDocument[]> {
    return await this.terminalRepository.getTerminalsByBusinessId(businessId);
  }

  async findByIdAndBusinessId(
    terminalId: string,
    businessId: string,
  ): Promise<TerminalDetail> {
    const terminalData =
      await this.terminalRepository.getTerminalByIdAndBusinessId(
        terminalId,
        businessId,
      );

    if (!terminalData) {
      throw new NotFoundError("Terminal not found");
    }

    const terminalDetail: TerminalDetail = {
      id: terminalData.id,
      name: terminalData.name,
      status: terminalData.status,
    };

    return terminalDetail;
  }

  async generateNewDeviceToken(deviceRefreshToken: string): Promise<string> {
    const verifyExist: JwtPayload = await this.jwtVerify(
      deviceRefreshToken,
      this.refreshSecret,
    );

    if (!verifyExist) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const payload = await this.session.getSession(deviceRefreshToken);

    if (!payload) {
      throw new UnauthorizedError("Authenticated user not found");
    }

    const newAccessToken = await this.jwtSignIn(
      payload,
      this.accessSecret,
      "3m",
    );

    console.log(newAccessToken);

    return newAccessToken;
  }
}
