import mongoose, { Document, Types } from "mongoose";
import { TerminalSessionSchema } from "./terminalSession.schema";
import { TerminalSessionStatus } from "./terminalSession.type";

export interface TerminalSessionType {
  terminalId: string;
  assignId: string;
  status: TerminalSessionStatus;
  assignTime: Date;
  logoutTime?: Date;
}

export interface ITerminalSessionDocument
  extends Omit<TerminalSessionType, "terminalId" | "assignId">, Document {
  terminalId: Types.ObjectId;
  assignId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const TerminalSessionModel = mongoose.model<ITerminalSessionDocument>(
  "TerminalSession",
  TerminalSessionSchema,
);
