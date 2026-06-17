import mongoose, { Document, Types } from "mongoose";
import {
  EntityType,
  NotificationPriority,
  NotificationType,
} from "./notification.type";
import { NotificationSchema } from "./notification.schema";

export interface MetaDataType<T = Record<string, any>> {
  entityId?: string | Types.ObjectId;
  entityType?: EntityType;
  actionUrl?: string;
  payload?: T;
}

export interface INotificationType {
  businessId: string;
  requestId: string;
  receipient?: string;
  receipientType: string;
  type: NotificationType;
  priority: NotificationPriority;
  metaData: MetaDataType;
  message: string;
  isRead: boolean;
  readBy?: string[];
}

export interface NotifyTerminalType {
  businessId: string;
  terminalId: string;
  ownerId: string;
  token?: string;
}

export interface INotificationDocument
  extends
    Omit<
      INotificationType,
      "businessId" | "receipient" | "readBy" | "requestId"
    >,
    Document {
  businessId: Types.ObjectId;
  requestId: Types.ObjectId;
  receipient?: Types.ObjectId;
  readBy?: Types.ObjectId[];
  deleted_at: Date;
  created_at: Date;
  updated_at: Date;
}

export const NotificationModel = mongoose.model<INotificationDocument>(
  "notification",
  NotificationSchema,
);
