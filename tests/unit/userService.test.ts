import { it, expect, describe, beforeEach, MockInstance, vi } from "vitest";
import { container } from "tsyringe";
import { TOKENS } from "../../src/config/tokens";
import { ICryptoService } from "../../src/utils/token";
import {
  IUserBusinessDocument,
  IUserBusinessRepository,
} from "../../src/features/userBusiness/interfaces/userBusiness.interface";
import { UserService } from "../../src/features/users/user.service";
import {
  CreateUserDTO,
  IUserRepository,
  IUserService,
} from "../../src/features/users/user.type";
import mongoose from "mongoose";
import { IUserDocument } from "../../src/features/auth/interfaces/authInterface";
import { InternalNotificationEmitter } from "../../src/core/notification.emitter";

const createdBy: string = "owner-123";

const mockToken: string = "token-123";

const mockPassword: string = "password123";

const mockBusinessId: string = "biz-123";

const mockUserId: string = "user-123";

const userData = {
  name: "ashiz",
  email: "ashiz@gmail.com",
  phone: "1231221",
  address: "23 geraldine road",
  status: "pending",
  role: "owner",
  businessId: "biz-123",
} as unknown as CreateUserDTO;

const newUserData = {
  id: "user-123",
  name: "ashiz",
  email: "ashiz@gmail.com",
  phone: "1231221",
  address: "23 geraldine road",
} as unknown as IUserDocument;

const userBusinessData = {
  userId: "user-123",
  businessId: "biz-123",
  role: "cashier",
  userStatus: "pending",
  createdBy: "owner-123",
} as unknown as IUserBusinessDocument;

describe("User service test", () => {
  let userService: IUserService;

  let mockSession: any;

  let mockCryptoService: {
    createToken: MockInstance<ICryptoService["createToken"]>;
    hashToken: MockInstance<ICryptoService["hashToken"]>;
  };
  let mockUserBusinessRepo: {
    canUserAccessBusiness: MockInstance<
      IUserBusinessRepository["canUserAccessBusiness"]
    >;
    assignUserWithSession: MockInstance<
      IUserBusinessRepository["assignUserWithSession"]
    >;

    findAndUpdateByUserIdWithSession: MockInstance<
      IUserBusinessRepository["findAndUpdateByUserIdWithSession"]
    >;
  };

  let mockUserRespository: {
    createUserWithSession: MockInstance<
      IUserRepository["createUserWithSession"]
    >;
    findAndUpdateByTokenWithSession: MockInstance<
      IUserRepository["findAndUpdateByTokenWithSession"]
    >;
  };

  let mockNotifyEmitter: {
    notify: MockInstance<InternalNotificationEmitter["notify"]>;
    onNotification: MockInstance<InternalNotificationEmitter["onNotification"]>;
  };
  beforeEach(() => {
    vi.resetAllMocks();
    container.clearInstances();

    mockCryptoService = {
      createToken: vi.fn(),
      hashToken: vi.fn(),
    };

    mockUserBusinessRepo = {
      canUserAccessBusiness: vi.fn(),
      assignUserWithSession: vi.fn(),
      findAndUpdateByUserIdWithSession: vi.fn(),
    };

    mockUserRespository = {
      createUserWithSession: vi.fn(),
      findAndUpdateByTokenWithSession: vi.fn(),
    };

    mockSession = {
      withTransaction: vi.fn().mockImplementation(async (fn) => {
        return await fn();
      }),
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      abortTransaction: vi.fn(),
      endSession: vi.fn(),
    };

    mockNotifyEmitter = {
      notify: vi.fn(),
      onNotification: vi.fn(),
    };

    container.registerInstance(TOKENS.USER_REPOSITORY, mockUserRespository);
    container.registerInstance(
      TOKENS.USER_BUSINESS_REPOSITORY,
      mockUserBusinessRepo,
    );
    container.registerInstance(TOKENS.NOTIFICATION_EMITTER, mockNotifyEmitter);
    container.registerInstance(TOKENS.CRYPTO_SERVICE, mockCryptoService);
    userService = container.resolve(UserService);
    vi.spyOn(mongoose, "startSession").mockResolvedValue(mockSession);
  });

  describe("Create user ", () => {
    beforeEach(() => {});

    it("should throw unauthorized user if canUserBusiness is false", async () => {
      mockUserBusinessRepo.canUserAccessBusiness.mockResolvedValue(false);
      const result = userService.createUser(userData, createdBy);
      await expect(result).rejects.toThrow(
        "User does not have right to access to the business",
      );
    });

    it("should call notify emitter and mongoose session works if new user is true ", async () => {
      mockUserBusinessRepo.canUserAccessBusiness.mockResolvedValue(true);
      mockUserRespository.createUserWithSession.mockResolvedValue({
        user: newUserData,
        newUser: true,
      } as any);
      mockUserBusinessRepo.assignUserWithSession.mockResolvedValue(
        userBusinessData,
      );

      await userService.createUser(userData, createdBy);
      expect(mockNotifyEmitter.notify).toHaveBeenCalled();
      expect(mockSession.withTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it("should not call notify emitter  if new user is false ", async () => {
      mockUserBusinessRepo.canUserAccessBusiness.mockResolvedValue(true);
      mockUserRespository.createUserWithSession.mockResolvedValue({
        user: newUserData,
        newUser: false,
      } as any);
      mockUserBusinessRepo.assignUserWithSession.mockResolvedValue(
        userBusinessData,
      );

      await userService.createUser(userData, createdBy);
      expect(mockNotifyEmitter.notify).not.toHaveBeenCalled();
    });
  });

  //working on this
  describe("Active user with password testing", () => {
    it("should abort transaction when user is not found", async () => {
      // 1. Setup the failure scenario
      mockUserRespository.findAndUpdateByTokenWithSession.mockResolvedValue(
        null,
      );

      await expect(
        userService.activateUserWithPassword(
          userData.businessId,
          mockToken,
          mockPassword,
        ),
      ).rejects.toThrow("User not found");

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it("should successfully call commit transaction ", async () => {
      mockUserRespository.findAndUpdateByTokenWithSession.mockResolvedValue(
        newUserData,
      );
      mockUserBusinessRepo.findAndUpdateByUserIdWithSession.mockResolvedValue(
        userBusinessData,
      );
      const result = await userService.activateUserWithPassword(
        userData.businessId,
        mockToken,
        mockPassword,
      );

      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(newUserData);
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });

  describe("Active user without password", () => {
    it("should throw user not found", async () => {
      mockUserBusinessRepo.findAndUpdateByUserIdWithSession.mockResolvedValue(
        null,
      );
      const result = userService.activateUserWithoutPassword(
        mockUserId,
        mockBusinessId,
        "owner",
      );

      await expect(result).rejects.toThrow("User not found");
    });

    it("should return true if everything is good", async () => {
      mockUserBusinessRepo.findAndUpdateByUserIdWithSession.mockResolvedValue(
        userBusinessData,
      );
      const result = await userService.activateUserWithoutPassword(
        mockUserId,
        mockBusinessId,
        "owner",
      );
      expect(result).toBe(true);
    });
  });
});
