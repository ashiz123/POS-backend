import { inject, injectable } from "tsyringe";
import {
  INotificationController,
  INotificationService,
} from "./notification.type";
import { TOKENS } from "../../config/tokens";
import { ApiResponse } from "../../types/apiResponseType";
import { INotificationDocument } from "./notification.model";
import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../../errors/httpErrors";

@injectable()
export class NotificationController implements INotificationController {
  constructor(
    @inject(TOKENS.NOTIFICATION_SERVICE)
    private notificationService: INotificationService,
  ) {}

  getAllNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.business) {
        throw new NotFoundError("Authenticated user not found");
      }

      const { role } = req.business;
      if (role !== "admin") {
        throw new Error("User role must be admin to see admin notifications");
      }

      const notifications =
        await this.notificationService.getAdminNotification();

      const response: ApiResponse<INotificationDocument[]> = {
        success: true,
        data: notifications,
      };

      res.status(200).json(response);
      return;
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
