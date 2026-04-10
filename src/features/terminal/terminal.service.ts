import { Connection } from "mongoose";
import { TOKENS } from "../../config/tokens";
import { TERMINAL_PAYMENT_STATUS, TERMINAL_STATUS } from "./terminal.constant";
import {
  ApproveTerminal,
  CreateTerminal,
  TerminalDocument,
  TerminalType,
} from "./terminal.model";
import { ITerminalRepository, ITerminalService } from "./terminal.type";
import { injectable, inject } from "tsyringe";
import { Queue } from "bullmq";
import { ICryptoService } from "../../utils/token";

@injectable()
export class TerminalService implements ITerminalService {
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
  ) {}

  async createTerminal(data: CreateTerminal): Promise<TerminalDocument> {
    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      const terminalData: TerminalType = {
        ownerId: data.ownerId,
        businessId: data.businessId,
        name: data.name,
        status: TERMINAL_STATUS.REQUESTED,
        paymentStatus: TERMINAL_PAYMENT_STATUS.PENDING,
        activationCode: this.cryptoService.generateActivationCode(),
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

  async approveTerminal(data: any): Promise<TerminalDocument | null> {
    const approveDTO: ApproveTerminal = {
      businessId: data.businessId,
      terminalId: data.terminalId,
      approvedBy: data.email,
      status: TERMINAL_STATUS.APPROVED,
      approvedAt: new Date(),
    };

    const terminalApproved =
      await this.terminalRepository.changeTerminalStatus(approveDTO);

    if (!terminalApproved) {
      throw new Error(
        "Could not approve terminal. It might not exist or isn't pending.",
      );
    }

    this.notificationOwnerQueue.add(
      "Approve-Terminal",
      {
        terminalId: terminalApproved.id,
        businessId: terminalApproved.businessId,
        ownerId: terminalApproved.ownerId,
      },
      {
        delay: 1 * 60 * 1000,
        attempts: 3,
        removeOnComplete: true,
      },
    );

    return terminalApproved;
  }

  async findByBusinessId(businessId: string): Promise<TerminalDocument[]> {
    return await this.terminalRepository.getTerminalsByBusinessId(businessId);
  }
}
