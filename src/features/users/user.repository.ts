import { ClientSession, Types } from "mongoose";
import { CrudRepository } from "../../shared/crudRepository";
import { injectable } from "tsyringe";
import User from "../auth/auth.model";
import { IUserDocument, IUserProps } from "../auth/interfaces/authInterface";
import { CreateUserDTO, IUserRepository, UpdateUserDTO } from "./user.type";
import { TerminalLoginType } from "../terminal/terminal.model";
import { ITerminalAuthData } from "../terminal/terminal.type";

@injectable()
export class UserRepository
  extends CrudRepository<IUserDocument, CreateUserDTO, UpdateUserDTO>
  implements IUserRepository
{
  constructor() {
    super(User);
  }

  async findAndUpdateByTokenWithSession(
    token: string,
    hashedPassword: string,
    session: ClientSession,
  ): Promise<IUserDocument | null> {
    console.log("datas", token);
    const updatedUser = await this.model.findOneAndUpdate(
      { verificationToken: token },
      {
        password: hashedPassword,
        is_verified: true,
        $unset: { verificationToken: "" },
      },
      { new: true, session }, // <- session goes inside options
    );

    return updatedUser;
  }

  async getAdmin(): Promise<IUserDocument | null> {
    return await this.model.findOne({ accountType: "admin" });
  }

  async getAllAdmin(): Promise<IUserDocument[]> {
    return await this.model.find({ accountType: "admin" });
  }

  async createUserWithSession(
    userData: CreateUserDTO,
    session: ClientSession,
  ): Promise<{ user: IUserDocument; newUser: boolean }> {
    const result = await this.model.findOneAndUpdate(
      { email: userData.email },
      {
        $setOnInsert: userData,
      },
      {
        upsert: true,
        new: true,
        session,
        includeResultMetadata: true, //raw data
      },
    );

    return {
      user: result.value!,
      newUser: !!result.lastErrorObject?.upserted,
    };
  }

  async getUserByBusinessId(businessId: string): Promise<IUserProps[]> {
    return this.model
      .find({ businessId: businessId, deletedAt: null })
      .lean() as Promise<IUserProps[]>;
  }

  async getAuthorizedContext(
    terminalLoginData: TerminalLoginType,
  ): Promise<ITerminalAuthData> {
    const { email, terminalId, businessId } = terminalLoginData;

    const castedBusinessId = new Types.ObjectId(businessId);
    const castedTerminalId = new Types.ObjectId(terminalId);

    const matchUser = {
      $match: {
        email: email,
      },
    };

    const lookUpUserBusiness = {
      $lookup: {
        from: "userbusinesses",
        localField: "_id", //field from users collection
        foreignField: "userId", //field from userBusinessCollection
        as: "businessMapping",
      },
    };

    const unwindBusinessMapping = {
      $unwind: "$businessMapping",
    };

    const matchSpecificBusiness = {
      $match: {
        "businessMapping.businessId": castedBusinessId,
      },
    };

    const lookupTerminal = {
      $lookup: {
        from: "terminals",
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", castedTerminalId] },
                  { $eq: ["$businessId", castedBusinessId] },
                ],
              },
            },
          },
        ],
        as: "terminal",
      },
    };

    const unwindBusinessTerminal = {
      $unwind: "$terminal",
    };

    const projectData = {
      $project: {
        _id: 1,
        email: 1,
        name: 1,
        role: "$businessMapping.role",
      },
    };

    const pipeline = [
      matchUser,
      lookUpUserBusiness,
      unwindBusinessMapping,
      matchSpecificBusiness,
      lookupTerminal,
      unwindBusinessTerminal,
      projectData,
    ];

    const result = await this.model.aggregate(pipeline).exec();

    console.log(result);
    if (!result || result.length === 0) {
      throw new Error(
        "Authentication failed: Invalid credentials, or user/terminal mapping is incorrect.",
      );
    }

    const userData = result[0];

    return {
      userId: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    };
  }
}

export const userRepository = new UserRepository();
