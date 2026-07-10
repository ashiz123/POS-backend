import { Schema } from "mongoose";
import { TERMINAL_SESSION_STATUS } from "./terminalSession.constant";
import { ITerminalSessionDocument } from "./terminalSession.model";

export const TerminalSessionSchema = new Schema<ITerminalSessionDocument>(
  {
    terminalId: { type: Schema.Types.ObjectId, ref: "Terminal" },
    assignId: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: Object.values(TERMINAL_SESSION_STATUS),
      default: TERMINAL_SESSION_STATUS.INACTIVE,
    },
    assignTime: { type: Date, default: Date.now() },
    logoutTime: { type: Date, default: null },
  },
  { timestamps: true },
);

TerminalSessionSchema.index(
  { terminalId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: TERMINAL_SESSION_STATUS.ACTIVE },
  },
);

TerminalSessionSchema.index({ terminalId: 1, status: 1, logoutTime: 1 });
TerminalSessionSchema.index({ _id: 1, status: 1, logoutTime: 1 });
