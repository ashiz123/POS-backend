import { CrudRepository } from "../../shared/crudRepository";
import { CreateTerminalDTO } from "./terminal.validation";
import {
  ApproveTerminal,
  TerminalDocument,
  TerminalModel,
  UpdateTerminalDTO,
} from "./terminal.model";
import { injectable } from "tsyringe";
import {
  ITerminalAuthContext,
  ITerminalRepository,
  PopulatedTerminal,
} from "./terminal.type";
import { ClientSession, Types } from "mongoose";
import { TERMINAL_STATUS } from "./terminal.constant";

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
          approvedAt: data.approvedAt,
          approvedBy: data.approvedBy,
        },
      },
      { new: true },
    );
  }

  async getTerminalById(
    terminalId: string,
    businessId: string,
  ): Promise<TerminalDocument | null> {
    return await this.model.findOne({
      _id: terminalId,
      businessId: businessId,
    });
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

  async getAuthorizedContext(
    terminalId: string,
    email: string,
  ): Promise<ITerminalAuthContext> {
    const matchTerminal = {
      $match: { _id: new Types.ObjectId(terminalId) },
    };

    const lookupUser = {
      $lookup: {
        from: "users",
        pipeline: [
          { $match: { email: email } },
          { $project: { _id: 1, email: 1 } },
        ],
        as: "user",
      },
    };

    const lookUpMembership = {
      $lookup: {
        from: "userbusinesses", //this is collection name, not the model name
        let: { bizId: "$businessId", userId: "$user._id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$businessId", "$$bizId"] },
                  { $eq: ["$userId", "$$userId"] },
                  { $eq: ["$userStatus", "active"] },
                ],
              },
            },
          },
        ],
        as: "membership",
      },
    };

    const formatOutput = {
      $project: {
        activationCode: 1,
        "user._id": 1,
        "user.email": 1,
        "membership.role": 1,
        businessId: 1,
      },
    };

    const pipeline = [
      matchTerminal,
      lookupUser,
      { $unwind: "$user" },
      lookUpMembership,
      { $unwind: "$membership" },
      formatOutput,
    ];

    const [result] = await this.model.aggregate(pipeline);
    return (result as ITerminalAuthContext) || null;
  }
}
