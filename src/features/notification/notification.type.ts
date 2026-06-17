import { NextFunction } from "express";
import {
  ENTITY_TYPE,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_TYPE,
} from "./notification.constant";
import {
  INotificationDocument,
  INotificationType,
  NotifyTerminalType,
} from "./notification.model";
import { RouteHandler } from "../../shared/baseType";

export type NotificationPriority =
  (typeof NOTIFICATION_PRIORITY)[keyof typeof NOTIFICATION_PRIORITY];

export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export type EntityType = (typeof ENTITY_TYPE)[keyof typeof ENTITY_TYPE];

export interface INotificationRepository {
  create(data: Partial<INotificationType>): Promise<INotificationDocument>;
  getAdminNotifications(): Promise<INotificationDocument[]>;

  /**
   * Bulk creates notifications (e.g., Notify all Admins that Payment System is down)
   */
  // createMany(data: Partial<INotification>[]): Promise<INotification[]>

  /**
   * Gets notifications for a specific user, sorted by priority and date
   */
  // getForUser(
  //     userId: string,
  //     limit?: number,
  //     skip?: number
  // ): Promise<INotification[]>

  // /**
  //  * Mark specific notifications as read
  //  */
  // markAsRead(notificationId: string): Promise<INotification | null>

  // /**
  //  * Marks all notifications for a user as read
  //  */
  // markAllAsRead(userId: string): Promise<void>

  // /**
  //  * Counts unread notifications for the badge icon
  //  */
  // getUnreadCount(userId: string): Promise<number>
}

export interface INotificationService {
  notifyTerminalCreate(
    businessId: string,
    terminalId: string,
    ownerId: string,
  ): Promise<void>;
  notifyTerminalApprove(data: NotifyTerminalType): Promise<void>;
  notifyTerminalActivate(data: NotifyTerminalType): Promise<void>;
  getAdminNotification(): Promise<INotificationDocument[]>;
  notifyStockLow(
    email: string,
    productName: string,
    productSKU: string,
  ): Promise<void>;
}

export interface INotificationController {
  getAllNotifications: RouteHandler;
}
