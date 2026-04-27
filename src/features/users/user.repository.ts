import { ClientSession } from "mongoose";
import { CrudRepository } from "../../shared/crudRepository";
import { injectable } from "tsyringe";
import User from "../auth/auth.model";
import { IUserDocument } from "../auth/interfaces/authInterface";
import { CreateUserDTO, IUserRepository, UpdateUserDTO } from "./user.type";

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
      { activationToken: token },
      {
        password: hashedPassword,
        is_verified: true,
        $unset: { activationToken: "" },
      },
      { new: true, session }, // <- session goes inside options
    );

    return updatedUser;
  }

  async getAdmin(): Promise<IUserDocument | null> {
    return await this.model.findOne({ role: "admin" });
  }

  async getAllAdmin(): Promise<IUserDocument[]> {
    return await this.model.find({ role: "admin" });
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
}

export const userRepository = new UserRepository();
