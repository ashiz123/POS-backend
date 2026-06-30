import mongoose, { Types, Model, ClientSession } from "mongoose";
import { injectable } from "tsyringe";
import { UserBusinessModel } from "./database/userBusiness_model.js";
import {
  IUserBusinessRepository,
  IUserBusinessDocument,
  AssignUserDTO,
  FindUserArgs,
  // UpdateUserRoleDTO,
} from "./interfaces/userBusiness.interface.js";
import { IUserDocument } from "../auth/interfaces/authInterface.js";
import { BusinessPropsLean } from "../business/business.model.js";

@injectable()
export class UserBusinessRepository implements IUserBusinessRepository {
  private model: Model<IUserBusinessDocument>;

  constructor() {
    this.model = UserBusinessModel;
  }

  async assignUserWithSession(
    data: AssignUserDTO,
    session?: ClientSession,
  ): Promise<IUserBusinessDocument> {
    const userBusinessData = {
      userId: new Types.ObjectId(data.userId),
      businessId: new Types.ObjectId(data.businessId),
      userStatus: data.userStatus,
      role: data.role,
      startDate: new Date(),
      createdBy: data.createdBy
        ? new Types.ObjectId(data.createdBy)
        : undefined,
    };

    const [userBusiness] = await this.model.create([userBusinessData], {
      session,
    });
    return userBusiness;
  }

  //working here with session
  async findAndUpdateByUserIdWithSession({
    userId,
    businessId,
    session,
  }: FindUserArgs): Promise<IUserBusinessDocument | null> {
    console.log("data", userId, businessId);
    const updateUser = await this.model.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        businessId: new mongoose.Types.ObjectId(businessId),
        userStatus: "pending",
      },
      { userStatus: "active" },
      { new: true, ...(session ? { session } : {}) },
    );
    return updateUser;
  }

  //to activate the owner
  async findAndUpdateByToken(
    token: string,
  ): Promise<IUserBusinessDocument | null> {
    return await this.model.findOneAndUpdate(
      { verificationToken: token },
      {
        userStatus: "active",
        $unset: { verificationToken: "" },
      },
      { new: true }, //return updated doc
    );
  }

  async canUserAccessBusiness(
    userId: string,
    businessId: string,
  ): Promise<boolean> {
    return Boolean(
      await this.model.exists({
        userId,
        businessId,
        userStatus: "active",
      }),
    );
  }

  async getUserBusiness(
    userId: string,
    businessId: string,
  ): Promise<IUserBusinessDocument | null> {
    const userBusinesses = await this.model.findOne({
      userId: new Types.ObjectId(userId),
      businessId: new Types.ObjectId(businessId),
      userStatus: "active",
    });

    return userBusinesses;
  }

  async checkUserExist(businessId: string, userId: string): Promise<boolean> {
    const count = await this.model.countDocuments({
      userId: new Types.ObjectId(userId),
      businessId: new Types.ObjectId(businessId),
      userStatus: "active",
    });

    return count > 0;
  }

  async getUserRole(
    userId: string,
    businessId: string,
  ): Promise<string | null> {
    const userBusiness = await this.model.findOne({
      userId: new Types.ObjectId(userId),
      businessId: new Types.ObjectId(businessId),
      userStatus: "active",
    });

    return userBusiness ? userBusiness.role : null;
  }

  async removeUser(userId: string, businessId: string): Promise<boolean> {
    const result = await this.model.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        businessId: new Types.ObjectId(businessId),
        userStatus: "active",
      },
      {
        isActive: false,
        endDate: new Date(),
        updatedAt: new Date(),
      },
      { new: true },
    );

    return !!result;
  }

  async getBusinessUsers(
    businessId: string,
    roles?: string[],
  ): Promise<IUserDocument[]> {
    const businessUsers = await this.model
      .find({
        businessId,
        userStatus: "active",
        ...(roles && roles.length > 0 && { role: { $in: roles } }), //if roles exist than include the role
      })
      .populate<{ userId: IUserDocument }>("userId");

    const users = businessUsers.map((ub) => ub.userId);

    return users;
  }

  //lean is added . lean must have all type exact like document. document have some hidden function accept data.
  async getUserBusinesses(userId: string): Promise<BusinessPropsLean[]> {
    const links = await this.model
      .find({
        userId: new Types.ObjectId(userId),
        userStatus: "active",
      })
      .populate("businessId")
      .lean();

    const businessList = links.map(
      (link) => link.businessId as unknown as BusinessPropsLean,
    );

    return businessList;
  }
}

export const userBusinessRepository = new UserBusinessRepository();
