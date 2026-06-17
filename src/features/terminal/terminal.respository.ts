import { CrudRepository } from "../../shared/crudRepository";
import { CreateTerminalDTO } from "./terminal.validation";
import {
  ApproveTerminal,
  TerminalDocument,
  TerminalModel,
  UpdateTerminalDTO,
} from "./terminal.model";
import { injectable } from "tsyringe";
import { PopulatedTerminal } from "./terminal.type";
import { ClientSession } from "mongoose";
import { TERMINAL_STATUS } from "./terminal.constant";
import { ITerminalRepository } from "./terminal.interface";

@injectable()
export class TerminalRepository
  extends CrudRepository<TerminalDocument, CreateTerminalDTO, UpdateTerminalDTO>
  implements ITerminalRepository
{
  constructor() {
    super(TerminalModel);
  }

  async createWithSession(
    data: CreateTerminalDTO,
    session: ClientSession,
  ): Promise<TerminalDocument> {
    const [terminal] = await this.model.create([data], { session });
    return terminal;
  }

  async changeTerminalStatus(
    data: ApproveTerminal,
  ): Promise<TerminalDocument | null> {
    return await this.model.findOneAndUpdate(
      {
        _id: data.terminalId,
        businessId: data.businessId,
        status: TERMINAL_STATUS.REQUESTED,
      },
      {
        $set: {
          status: TERMINAL_STATUS.APPROVED,
          activationCode: data.activationCode,
          approvedAt: data.approvedAt,
          approvedBy: data.approvedBy,
        },
      },
      { new: true },
    );
  }

  async getTerminalByIdAndBusinessId(
    terminalId: string,
    businessId: string,
  ): Promise<TerminalDocument | null> {
    return await this.model.findOne({
      _id: terminalId,
      businessId: businessId,
    });
  }

  async getTerminalByActivationCodeAndUpdate(
    activationCode: string,
  ): Promise<TerminalDocument | null> {
    return await this.model.findOneAndUpdate(
      {
        activationCode,
        activationStatus: false,
      },
      {
        $set: {
          activationCode: null,
          activationStatus: true,
        },
      },
      { new: true }, // this return the document
    );
  }

  async getTerminalsByBusinessId(
    businessId: string,
  ): Promise<TerminalDocument[]> {
    return await this.model.find({
      businessId,
      status: TERMINAL_STATUS.APPROVED,
    });
  }

  async findTerminalById(terminalId: string): Promise<TerminalDocument | null> {
    return await this.model.findOne({ terminalId });
  }

  async getBusiness(terminalId: string): Promise<PopulatedTerminal | null> {
    const result = await this.model
      .findById(terminalId)
      .populate("businessId")
      .exec();

    return result as unknown as PopulatedTerminal | null;
  }
}
