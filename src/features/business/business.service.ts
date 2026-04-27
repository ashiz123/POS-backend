import mongoose, { UpdateQuery } from "mongoose";
import { IBusinessRepository, IBusinessService } from "./business.type";
import { BusinessProps, CreateBusinessDTO } from "./business.model";
import { IUserBusinessRepository } from "../userBusiness/interfaces/userBusiness.interface";
import { ICryptoService } from "../../utils/token";
import { IBusinessDocument } from "./database/business_db_model";
import { IUserRepository } from "../users/user.type";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../config/tokens";
import { IInternalNotificationEmitter } from "../../core/notification.emitter";

import { UserStatus } from "../userBusiness/interfaces/userBusiness.interface";
import { NotFoundError } from "../../errors/httpErrors";

export type AuthUserBusinessProps = BusinessProps & { userId: string };

@injectable()
export class BusinessService implements IBusinessService<BusinessProps> {
  constructor(
    @inject(TOKENS.NOTIFICATION_EMITTER)
    private notificationEmitter: IInternalNotificationEmitter,
    @inject(TOKENS.BUSINESS_REPOSITORY)
    private readonly businessRepo: IBusinessRepository,
    @inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @inject(TOKENS.USER_BUSINESS_REPOSITORY)
    private readonly userBusinessRepo: IUserBusinessRepository,
    @inject(TOKENS.CRYPTO_SERVICE)
    private readonly cryptoService: ICryptoService,
  ) {}

  async getById(id: string): Promise<BusinessProps | null> {
    return this.businessRepo.findById(id);
  }

  async getAll(): Promise<BusinessProps[]> {
    return this.businessRepo.findAll();
  }

  async create(
    data: CreateBusinessDTO & {
      userId: string;
      email: string;
    },
  ): Promise<IBusinessDocument> {
    const token = this.cryptoService.createToken();

    const admin = await this.userRepository.getAdmin();

    if (!admin) {
      throw new Error("Admin not found to create the business");
    }

    const session = await mongoose.startSession();

    try {
      // Use withTransaction to handle rollback + retries
      const newBusiness = await session.withTransaction(async () => {
        // Create business inside transaction
        const createdBusiness = await this.businessRepo.createWithSession(
          {
            ...data,
            activationToken: this.cryptoService.hashToken(token),
          },
          session,
        );

        // Assign user to business
        await this.userBusinessRepo.assignUserWithSession(
          {
            userId: data.userId,
            businessId: createdBusiness.id,
            role: "owner",
            userStatus: UserStatus.PENDING,
          },
          session,
        );

        return createdBusiness;
      });

      this.notificationEmitter.notify({
        email: admin.email,
        subject: "Activate your business",
        message: `Activate your account by clicking on this link: http://localhost:3000/api/businessActivation/${data.userId}/${token}`,
      });

      // withTransaction guarantees newBusiness exists if no error
      return newBusiness!;
    } finally {
      await session.endSession();
    }
  }

  async update(
    id: string,
    data: UpdateQuery<BusinessProps>,
  ): Promise<BusinessProps | null> {
    const updatedBusiness = await this.businessRepo.update(id, data);

    if (!updatedBusiness) {
      throw new NotFoundError("Business not found");
    }

    return updatedBusiness;
  }

  async delete(id: string): Promise<boolean> {
    const isDeleted = await this.businessRepo.delete(id);

    if (!isDeleted) {
      // This triggers the 404 flow in your controller
      throw new NotFoundError("User not found in database");
    }

    return isDeleted;
  }

  async filterBusinessByAuthUser(authId: string): Promise<BusinessProps[]> {
    return this.businessRepo.filterByUserId(authId);
  }

  async filterBusinessByName(name: string): Promise<BusinessProps | null> {
    return this.businessRepo.filterByName(name);
  }

  async activateUser(
    token: string,
    userId: string,
    userEmail: string,
  ): Promise<boolean> {
    const session = await mongoose.startSession();

    try {
      let activated = false;

      await session.withTransaction(async () => {
        const hashedToken = this.cryptoService.hashToken(token);

        const activateBusiness = await this.businessRepo.findAndUpdateByToken(
          hashedToken,
          session,
        );

        if (!activateBusiness) {
          throw new NotFoundError("Activated business not found");
        }

        await this.userBusinessRepo.findAndUpdateByUserIdWithSession({
          userId: userId,
          businessId: activateBusiness.id,
          role: "owner",
          session: session,
        });

        activated = true;
      });

      this.notificationEmitter.notify({
        email: userEmail,
        subject: "Business Activated",
        message: "Your business is successfully activated",
      });

      return activated;
    } finally {
      await session.endSession();
    }
  }
}
