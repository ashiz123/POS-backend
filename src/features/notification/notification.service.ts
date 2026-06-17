import { injectable, inject } from "tsyringe";
import {
  INotificationRepository,
  INotificationService,
} from "./notification.type";
import { TOKENS } from "../../config/tokens";
import { IUserRepository } from "../users/user.type";
import { USER_ROLE } from "../auth/user.constant";
import {
  ENTITY_TYPE,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_TYPE,
} from "./notification.constant";
import {
  INotificationDocument,
  INotificationType,
  MetaDataType,
  NotifyTerminalType,
} from "./notification.model";
import { IInternalNotificationEmitter } from "../../core/notification.emitter";
import { NotFoundError } from "../../errors/httpErrors";
import { ITerminalRepository } from "../terminal/terminal.interface";

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(TOKENS.NOTIFICATION_REPOSITORY)
    private notificationRepository: INotificationRepository,

    @inject(TOKENS.USER_REPOSITORY) private userRepository: IUserRepository,

    @inject(TOKENS.NOTIFICATION_EMITTER)
    private notificationEmitter: IInternalNotificationEmitter,

    @inject(TOKENS.TERMINAL_REPOSITORY)
    private terminalRepository: ITerminalRepository,
  ) {}

  async notifyTerminalCreate(
    businessId: string,
    terminalId: string,
    ownerId: string,
  ): Promise<void> {
    const allAdmin = await this.userRepository.getAllAdmin();
    if (allAdmin.length <= 0) {
      throw new Error("Admin not found");
    }

    const notificationMeta: MetaDataType = {
      entityId: terminalId,
      entityType: ENTITY_TYPE.TERMINAL,
    };

    const notificationData: INotificationType = {
      businessId: businessId,
      requestId: ownerId,
      receipientType: USER_ROLE.ADMIN,
      type: NOTIFICATION_TYPE.TERMINAL_CREATE,
      priority: NOTIFICATION_PRIORITY.HIGH,
      metaData: notificationMeta,
      message: "Request to create terminal",
      isRead: false,
    };

    await this.notificationRepository.create(notificationData);

    for (const admin of allAdmin) {
      const data = {
        email: admin.email,
        subject: "Request to terminal create",
        message: "Terminal creation request",
      };
      this.notificationEmitter.notify(data);
    }

    console.log("notification sent successfully");

    //send the email to all admin from here
  }

  async notifyTerminalApprove(data: NotifyTerminalType): Promise<void> {
    //notify owner by ownerId to create terminal of businessId
    try {
      const { ownerId, businessId, terminalId } = data;
      const user = await this.userRepository.findById(ownerId);

      if (!user) {
        throw new NotFoundError("Owner not exist");
      }

      const terminal =
        await this.terminalRepository.getTerminalByIdAndBusinessId(
          terminalId,
          businessId,
        );

      if (!terminal) {
        throw new NotFoundError("Terminal not found");
      }

      const notifyOwner = {
        email: user.email,
        subject: "Approved Terminal",
        message: `Your terminal is accepted. Here is your activation code ${data.token}`,
      };

      this.notificationEmitter.notify(notifyOwner);
      console.log("email sent successfully");
    } catch (error) {
      console.log(error);
      throw new Error("Notification Service failed to process request", {
        cause: error,
      });
    }
  }

  async notifyTerminalActivate(data: NotifyTerminalType): Promise<void> {
    try {
      const { ownerId, businessId, terminalId } = data;
      const user = await this.userRepository.findById(ownerId);

      if (!user) {
        throw new NotFoundError("Owner not exist");
      }

      const terminal =
        await this.terminalRepository.getTerminalByIdAndBusinessId(
          terminalId,
          businessId,
        );

      if (!terminal) {
        throw new NotFoundError("Terminal not found");
      }

      const notifyOwner = {
        email: user.email,
        subject: "Activate Terminal",
        message: `Your terminal is activated`,
      };

      this.notificationEmitter.notify(notifyOwner);
      console.log("email sent successfully");
    } catch (error) {
      console.log(error);
      throw new Error("Notification Service failed to process request", {
        cause: error,
      });
    }
  }

  async getAdminNotification(): Promise<INotificationDocument[]> {
    return await this.notificationRepository.getAdminNotifications();
  }

  async notifyStockLow(email: string, productName: string, productSKU: string) {
    const notifyLowStock = {
      email: email,
      subject: `Action Required: Low Inventory for ${productSKU}`,
      message: `Hello,\n\nThis is an automated alert to notify you that the inventory for ${productName} (SKU: ${productSKU}) has reached the low-stock threshold.\n\nPlease review your inventory levels and reorder as necessary to prevent any disruption in sales.\n\nThank you.`,
    };

    this.notificationEmitter.notify(notifyLowStock);
  }
}
