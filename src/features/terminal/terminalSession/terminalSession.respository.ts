import { inject, injectable } from "tsyringe";
import { ITerminalSessionRepository } from "./terminalSession.type";

import { Model } from "mongoose";
import {
  ITerminalSessionDocument,
  TerminalSessionType,
} from "./terminalSession.model";
import { BadRequestError, ConflictError } from "../../../errors/httpErrors";
import { TOKENS } from "../../../config/tokens";
import { TERMINAL_SESSION_STATUS } from "./terminalSession.constant";

@injectable()
export class TerminalSessionRepository implements ITerminalSessionRepository {
  constructor(
    @inject(TOKENS.TERMINAL_SESSION_MODEL)
    private _model: Model<ITerminalSessionDocument>,
  ) {}

  async createTerminalSession(
    data: TerminalSessionType,
  ): Promise<ITerminalSessionDocument> {
    try {
      await this._model.updateMany(
        { terminalId: data.terminalId, status: TERMINAL_SESSION_STATUS.ACTIVE },
        {
          $set: {
            status: TERMINAL_SESSION_STATUS.INACTIVE,
            logoutTime: new Date(),
          },
        },
      );

      return await this._model.create(data);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictError("This terminal is already been logged in ");
      }

      throw new BadRequestError(
        `Terminal session cannot be created ${error.message} `,
        "TerminalSessionRespository",
      );
    }
  }

  async closeTerminalSession(
    terminalSessionId: string,
  ): Promise<ITerminalSessionDocument | null> {
    return this._model.findOneAndUpdate(
      { _id: terminalSessionId, status: TERMINAL_SESSION_STATUS.ACTIVE },
      {
        $set: {
          status: TERMINAL_SESSION_STATUS.INACTIVE,
          logoutTime: new Date(),
        },
      },
      { new: true },
    );
  }

  // async setTerminalInactive(
  //   terminalId: string,
  // ): Promise<ITerminalSessionDocument | null> {
  //   return await this._model.findOneAndUpdate(
  //     { status: TERMINAL_SESSION_STATUS.INACTIVE },

  //     {
  //       $set: {
  //         terminalId: terminalId,
  //         status: TERMINAL_SESSION_STATUS.ACTIVE,
  //         assignTime: new Date(),
  //       },
  //     },

  //     {
  //       sort: { createdAt: -1 },
  //       new: true,
  //     },
  //   );
  // }
}
