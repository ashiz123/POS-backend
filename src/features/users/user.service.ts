import mongoose from "mongoose";
import { IUserDocument, IUserProps } from "../auth/interfaces/authInterface";
import { CreateUserDTO, IUserRepository, IUserService } from "./user.type";
import { UnauthorizedError } from "../../errors/httpErrors";
import { hashPassword } from "../../utils/password";
import { ICryptoService } from "../../utils/token";

import { TOKENS } from "../../config/tokens";
import { injectable, inject } from "tsyringe";
import {
  IUserBusinessRepository,
  UserStatus,
} from "../userBusiness/interfaces/userBusiness.interface";
import { IInternalNotificationEmitter } from "../../core/notification.emitter";

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TOKENS.USER_REPOSITORY) private repository: IUserRepository,
    @inject(TOKENS.USER_BUSINESS_REPOSITORY)
    private userBusinessRepository: IUserBusinessRepository,
    @inject(TOKENS.NOTIFICATION_EMITTER)
    private notificationEmitter: IInternalNotificationEmitter,
    @inject(TOKENS.CRYPTO_SERVICE)
    private crytoService: ICryptoService,
  ) {}

  createUser = async (
    userData: CreateUserDTO,
    createdBy: string,
  ): Promise<IUserDocument> => {
    const token = this.crytoService.createToken();
    let status: "active" | "pending";

    const canUserAccess =
      await this.userBusinessRepository.canUserAccessBusiness(
        createdBy,
        userData.businessId,
      );

    if (!canUserAccess) {
      throw new UnauthorizedError(
        "User does not have right to access to the business",
      );
    }

    const session = await mongoose.startSession();
    try {
      const createEmployee = await session.withTransaction(async () => {
        const { user, newUser } = await this.repository.createUserWithSession(
          {
            ...userData,
            activationToken: this.crytoService.hashToken(token),
          },
          session,
        );

        if (newUser) {
          status = UserStatus.PENDING;
        } else {
          status = UserStatus.ACTIVE;
        }

        await this.userBusinessRepository.assignUserWithSession(
          {
            userId: user.id,
            businessId: userData.businessId,
            role: userData.role,
            createdBy,
            userStatus: status,
          },
          session,
        );

        return { user, newUser };
      });

      const { user, newUser } = createEmployee!;

      if (newUser) {
        //if new user than send the link to change password and activate account
        this.notificationEmitter.notify({
          email: userData.email,
          subject: "Activate your account",
          message: `Activate your account by clicking on this link: http://localhost:3000/api/userActivation/${userData.businessId}/${token}`,
        });
      }

      return user;
    } finally {
      await session.endSession();
    }
  };

  getUserById = async (id: string): Promise<IUserProps | null> => {
    return this.repository.findById(id);
  };

  activateUserWithPassword = async (
    businessId: string,
    token: string,
    password: string,
  ): Promise<IUserDocument | null> => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const hashedToken = this.crytoService.hashToken(token);

      const updatedUser = await this.repository.findAndUpdateByTokenWithSession(
        hashedToken,
        await hashPassword(password),
        session,
      );

      if (!updatedUser) {
        session.abortTransaction();
        throw new Error("User not found");
      }

      await this.userBusinessRepository.findAndUpdateByUserIdWithSession(
        updatedUser.id,
        updatedUser.role,
        businessId,
        session,
      );

      await session.commitTransaction();

      return updatedUser;
    } catch (error) {
      throw new Error(
        `Failed to create business: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      await session.endSession();
    }
  };

  activateUserWithoutPassword = async (
    userId: string,
    businessId: string,
    role: string,
  ): Promise<boolean> => {
    const userBusinessUpdate =
      await this.userBusinessRepository.findAndUpdateByUserIdWithSession(
        userId,
        businessId,
        role,
      );

    if (!userBusinessUpdate) {
      throw new Error("User not found");
    }

    return true;
  };
}
