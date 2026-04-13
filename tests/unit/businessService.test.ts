import "reflect-metadata";
import { container } from "tsyringe";
import { beforeEach, describe, expect, it, MockInstance, vi } from "vitest";
import { TOKENS } from "../../src/config/tokens";
import { IUserRepository } from "../../src/features/users/user.type";
import {
  IBusinessRepository,
  IBusinessService,
} from "../../src/features/business/business.type";
import { BusinessService } from "../../src/features/business/business.service";
import {
  BusinessProps,
  CreateBusinessDTO,
} from "../../src/features/business/business.model";
import { ICryptoService } from "../../src/utils/token";
import mongoose, { ClientSession } from "mongoose";
import { IUserDocument } from "../../src/features/auth/interfaces/authInterface";
import {
  IUserBusinessDocument,
  IUserBusinessRepository,
} from "../../src/features/userBusiness/interfaces/userBusiness.interface";
import { IBusinessDocument } from "../../src/features/business/database/business_db_model";
import { USER_ROLE } from "../../src/features/auth/user.constant";
import { IInternalNotificationEmitter } from "../../src/core/notification.emitter";

const newBusiness = {
  name: "Ashiz-Business",
  address: "137 shorncliffe road",
  userId: "23423423",
  email: "ashiz@gmail.com",
} as unknown as CreateBusinessDTO & { userId: string; email: string };

const adminUser = {
  id: "admin-123",
  name: "Ashiz",
  email: "ashizhamal@gmail.com",
  phone: "989000",
} as unknown as IUserDocument;

const businessDoc = {
  name: "Ashiz-Business",
  address: "137 shorncliffe road",
  email: "ashiz@gmail.com",
} as unknown as IBusinessDocument;

const userBusinessData = {
  userId: "user-123",
  businessId: "biz-123",
  role: USER_ROLE.OWNER,
  userStatus: "pending",
} as unknown as IUserBusinessDocument;

const mockToken = "mock-token";

describe("Business service test", () => {
  let businessService: IBusinessService<BusinessProps>;
  let mockSession: Partial<ClientSession>;
  let mockUserRepository: {
    getAdmin: MockInstance<IUserRepository["getAdmin"]>;
  };
  let mockCryptoService: {
    createToken: MockInstance<ICryptoService["createToken"]>;
    hashToken: MockInstance<ICryptoService["hashToken"]>;
    generateActivationCode: MockInstance<
      ICryptoService["generateActivationCode"]
    >;
  };

  let mockBusinessRepository: {
    createWithSession: MockInstance<IBusinessRepository["createWithSession"]>;
    findAndUpdateByToken: MockInstance<
      IBusinessRepository["findAndUpdateByToken"]
    >;
  };

  let mockUserBusinessRepository: {
    assignUserWithSession: MockInstance<
      IUserBusinessRepository["assignUserWithSession"]
    >;
    findAndUpdateByUserIdWithSession: MockInstance<
      IUserBusinessRepository["findAndUpdateByUserIdWithSession"]
    >;
  };

  let mockNotificationEmitter: {
    notify: MockInstance<IInternalNotificationEmitter["notify"]>;
    onNotification: MockInstance<
      IInternalNotificationEmitter["onNotification"]
    >;
  };

  beforeEach(() => {
    container.clearInstances();

    mockUserRepository = {
      getAdmin: vi.fn(),
    };

    mockCryptoService = {
      createToken: vi.fn(),
      hashToken: vi.fn(),
      generateActivationCode: vi.fn(),
    };

    mockSession = {
      withTransaction: vi.fn((callback) => callback()), // Executes the inner logic
      endSession: vi.fn(),
    };

    mockBusinessRepository = {
      createWithSession: vi.fn(),
      findAndUpdateByToken: vi.fn(),
    };

    mockUserBusinessRepository = {
      assignUserWithSession: vi.fn(),
      findAndUpdateByUserIdWithSession: vi.fn(),
    };

    mockNotificationEmitter = {
      notify: vi.fn(),
      onNotification: vi.fn(),
    };

    mongoose.startSession = vi.fn().mockResolvedValue(mockSession);

    container.registerInstance(
      TOKENS.NOTIFICATION_EMITTER,
      mockNotificationEmitter,
    );
    container.registerInstance(
      TOKENS.BUSINESS_REPOSITORY,
      mockBusinessRepository,
    );
    container.registerInstance(TOKENS.USER_REPOSITORY, mockUserRepository);
    container.registerInstance(
      TOKENS.USER_BUSINESS_REPOSITORY,
      mockUserBusinessRepository,
    );
    container.registerInstance(TOKENS.CRYPTO_SERVICE, mockCryptoService);

    businessService = container.resolve(BusinessService);
  });

  describe("Create business test", () => {
    it("should throw error Admin not found to create the business", async () => {
      mockUserRepository.getAdmin.mockResolvedValue(null);
      const result = businessService.create(newBusiness);
      await expect(result).rejects.toThrow(
        "Admin not found to create the business",
      );
    });

    it("should successfully create the business", async () => {
      mockUserRepository.getAdmin.mockResolvedValue(adminUser);
      mockCryptoService.createToken.mockReturnValue(mockToken);
      mockBusinessRepository.createWithSession.mockResolvedValue(businessDoc);
      mockUserBusinessRepository.assignUserWithSession.mockResolvedValue(
        userBusinessData,
      );
      const createBusiness = await businessService.create(newBusiness);
      expect(mockSession.withTransaction).toHaveBeenCalled();
      expect(mongoose.startSession).toHaveBeenCalled();
      expect(createBusiness).toEqual(businessDoc);
      expect(mockNotificationEmitter.notify).toHaveBeenCalledWith({
        email: adminUser.email,
        subject: "Activate your business",
        message: `Activate your account by clicking on this link: http://localhost:3000/api/businessActivation/${newBusiness.userId}/${mockToken}`,
      });
    });

    it("should always call endSession even if the transaction fails", async () => {
      const errorMessage = new Error("Transaction Failed");
      mockUserRepository.getAdmin.mockResolvedValue(adminUser);
      mockBusinessRepository.createWithSession.mockResolvedValue(businessDoc);
      mockUserBusinessRepository.assignUserWithSession.mockRejectedValue(
        errorMessage,
      );
      const result = businessService.create(newBusiness);
      await expect(result).rejects.toThrow(errorMessage);
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });

  describe("Activate user test", () => {
    const rawToken = "raw-token";
    const hashedToken = "hashed-token";

    it("should throw error if activated business not found", async () => {
      mockBusinessRepository.findAndUpdateByToken.mockResolvedValue(null);
      mockCryptoService.hashToken.mockReturnValue(hashedToken);
      const result = businessService.activateUser(
        rawToken,
        "user-123",
        "ashiz@gmail.com",
      );

      await expect(result).rejects.toThrow("Activated business not found");
      expect(mockBusinessRepository.findAndUpdateByToken).toHaveBeenCalledWith(
        hashedToken,
        mockSession,
      );
    });

    it("should display activated true if user is activated ", async () => {
      mockBusinessRepository.findAndUpdateByToken.mockResolvedValue(
        businessDoc,
      );
      mockCryptoService.hashToken.mockReturnValue(hashedToken);
      const result = await businessService.activateUser(
        rawToken,
        "user-123",
        "ashiz@gmail.com",
      );

      expect(
        mockUserBusinessRepository.findAndUpdateByUserIdWithSession,
      ).toHaveBeenCalledWith("user-123", "owner", businessDoc.id, mockSession);
      expect(mockNotificationEmitter.notify).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});
