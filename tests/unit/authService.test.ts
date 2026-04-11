import "reflect-metadata";
import { container } from "tsyringe";

import {
  beforeEach,
  describe,
  expect,
  it,
  Mock,
  MockInstance,
  vi,
} from "vitest";
import { AuthService } from "../../src/features/auth/auth.service";
import { TOKENS } from "../../src/config/tokens";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../src/errors/httpErrors";
import { ComparePasswordFn } from "../../src/utils/password";
import { GenerateTokenType, SignInType } from "../../src/utils/jwtService";
import {
  IUserBusinessDocument,
  IUserBusinessRepository,
} from "../../src/features/userBusiness/interfaces/userBusiness.interface";
import { LoginWithSelectBusinessDTO } from "../../src/features/auth/types/LoginResponse.type";
import { ISessionService } from "../../src/features/session/session.type";
import { USER_ROLE } from "../../src/features/auth/user.constant";
import { Payload } from "../../src/features/auth/interfaces/authInterface";
import { ICryptoService } from "../../src/utils/token";

import {
  IAuthCodeDocument,
  IAuthCodeRepository,
} from "../../src/features/authCode/authCode.type";

// 1. Keep the data outside the describe
const mockUserData = {
  email: "ashiz@example.com",
  password: "password123",
};

const mockAdminData = {
  ...mockUserData,
  role: "admin",
};

const mockOwnerData = {
  ...mockUserData,
  role: "owner",
};

const mockRawBusinessData = [
  {
    businessId: { toString: () => "bus_123" },
    role: "owner",
    userStatus: "active",
  },
  {
    businessId: { toString: () => "bus_456" },
    role: "admin",
    userStatus: "pending",
  },
] as unknown as IUserBusinessDocument[];

const mockJwtToken = "mocked-jwt-token";

const existingUser = { _id: "user_1", ...mockUserData };

const mockUserBusinessData: LoginWithSelectBusinessDTO = {
  userId: "user-123",
  email: "ashiz@gmail.com",
  type: "owner",
  businessId: "biz-123",
};

const mockAccessCode: string = "123456";

describe("AuthService", () => {
  // 2. Define dependencies inside the describe
  let authService: AuthService;
  let mockAuthRepo: any;
  let mockComparePassword: Mock<ComparePasswordFn>;
  let mockJwtSignIn: Mock<SignInType>;
  let mockGenerateToken: Mock<GenerateTokenType>;
  let mockUserBusinessRepo: {
    getUserBusinesses: MockInstance<
      IUserBusinessRepository["getUserBusinesses"]
    >;
    getUserBusiness: MockInstance<IUserBusinessRepository["getUserBusiness"]>;
  };

  let mockSessionService: {
    createSession: MockInstance<ISessionService["createSession"]>;
  };

  let mockCryptoService: {
    createToken: MockInstance<ICryptoService["createToken"]>;
    hashToken: MockInstance<ICryptoService["hashToken"]>;
    generateActivationCode: MockInstance<
      ICryptoService["generateActivationCode"]
    >;
  };

  let mockAuthCodeRepository: {
    create: MockInstance<IAuthCodeRepository["create"]>;
    getByEmail: MockInstance<IAuthCodeRepository["getByEmail"]>;
    delete: MockInstance<IAuthCodeRepository["delete"]>;
  };

  beforeEach(() => {
    // 3. Mock everything that needs to run before the function runs
    container.clearInstances();

    mockAuthRepo = {
      findByEmail: vi.fn(),
      createUser: vi.fn(),
    };

    mockUserBusinessRepo = {
      getUserBusinesses: vi.fn(),
      getUserBusiness: vi.fn(),
    };

    mockSessionService = {
      createSession: vi.fn(),
    };

    mockCryptoService = {
      createToken: vi.fn(),
      hashToken: vi.fn(),
      generateActivationCode: vi.fn(),
    };

    mockAuthCodeRepository = {
      create: vi.fn(),
      getByEmail: vi.fn(),
      delete: vi.fn(),
    };

    mockComparePassword = vi.fn(); //it should assign first.
    mockJwtSignIn = vi.fn();
    mockGenerateToken = vi.fn();
    // Inject the mock instead of the real repository
    container.registerInstance(TOKENS.AUTH_REPOSITORY, mockAuthRepo);
    container.registerInstance(TOKENS.SESSION_SERVICE, mockSessionService);
    container.registerInstance(
      TOKENS.USER_BUSINESS_REPOSITORY,
      mockUserBusinessRepo,
    );
    container.registerInstance(TOKENS.NOTIFICATION_EMITTER, {});
    container.registerInstance(
      TOKENS.AUTHCODE_REPOSITORY,
      mockAuthCodeRepository,
    );
    container.registerInstance(TOKENS.COMPARE_PASSWORD, mockComparePassword);
    container.registerInstance(TOKENS.JWT_SIGN_IN, mockJwtSignIn);
    container.registerInstance(TOKENS.GENERATE_TOKEN, mockGenerateToken);
    container.registerInstance(TOKENS.CRYPTO_SERVICE, mockCryptoService); //in test replace registerSingleton by registerInstance. as we are mocking the object
    authService = container.resolve(AuthService);

    vi.spyOn(authService, "adminLogin").mockResolvedValue(mockAccessCode);
  });

  describe("AuthService register user", () => {
    it("should throw ConflictError if user already exists", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue(existingUser);
      const call = authService.register(mockUserData as any);
      await expect(call).rejects.toThrow(ConflictError);
      expect(mockAuthRepo.createUser).not.toHaveBeenCalled();
    });

    it("should create a new user if email is free", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue(null);
      mockAuthRepo.createUser.mockResolvedValue({
        ...mockUserData,
        _id: "new_id",
      });

      const result = await authService.register(mockUserData as any);

      expect(result).toHaveProperty("_id", "new_id");
      expect(mockAuthRepo.createUser).toHaveBeenCalledWith(mockUserData);
    });
  });

  describe("AuthService login user", () => {
    it("should throw user not found", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue(null);
      const result = authService.login(
        mockUserData.email,
        mockUserData.password,
      );
      await expect(result).rejects.toThrow(NotFoundError);
    });

    it("should throw unauthorized user", async () => {
      mockComparePassword.mockResolvedValue(false);
      mockAuthRepo.findByEmail.mockResolvedValue(mockUserData);
      const result = authService.login(mockUserData.email, "wrong-password");
      await expect(result).rejects.toThrow(UnauthorizedError);
    });

    it("should return admin response", async () => {
      mockComparePassword.mockResolvedValue(true);
      mockAuthRepo.findByEmail.mockResolvedValue(mockAdminData);
      const result = await authService.login(
        mockUserData.email,
        "right-password",
      );
      expect(result).toEqual({
        role: "admin",
        email: "ashiz@example.com",
        otp: "123456",
      });
    });

    it("should logged in with business associated if its not admin", async () => {
      mockComparePassword.mockResolvedValue(true);
      mockJwtSignIn.mockResolvedValue(mockJwtToken);
      mockAuthRepo.findByEmail.mockResolvedValue(mockOwnerData);
      mockUserBusinessRepo.getUserBusinesses.mockResolvedValue(
        mockRawBusinessData,
      );
      const result = await authService.login(
        mockUserData.email,
        "right-password",
      );
      expect(result).toEqual({
        email: "ashiz@example.com",
        token: "mocked-jwt-token",
        businesses: [
          {
            businessId: "bus_123",
            role: "owner",
            userStatus: "active",
          },
          {
            businessId: "bus_456",
            role: "admin",
            userStatus: "pending",
          },
        ],
      });
    });
  });

  describe("AuthService login user with business", () => {
    it("should throw error if userBusiness dont have record with userId and businessId", async () => {
      mockUserBusinessRepo.getUserBusiness.mockResolvedValue(null);
      const result = authService.loginWithSelectBusiness(mockUserBusinessData);
      await expect(result).rejects.toThrow(
        "User has no businesses, You are not authorized to login",
      );
      expect(mockGenerateToken).not.toHaveBeenCalled();
    });

    it("should logged in use successfully with business", async () => {
      //mock
      const mockUserBusinessResponse = {
        userId: "user-123",
        businessId: "biz-123",
        role: USER_ROLE.OWNER,
        userStatus: "pending",
      } as unknown as IUserBusinessDocument;

      mockUserBusinessRepo.getUserBusiness.mockResolvedValue(
        mockUserBusinessResponse,
      );
      mockGenerateToken.mockResolvedValue(mockAccessCode);

      //act
      await authService.loginWithSelectBusiness(mockUserBusinessData);

      //assertion
      const expectedPayload: Payload = {
        sub: mockUserBusinessData.userId,
        email: mockUserBusinessData.email,
        role: mockUserBusinessResponse.role,
        status: mockUserBusinessResponse.userStatus,
        businessId: mockUserBusinessData.businessId,
        type: "access",
      };

      expect(mockGenerateToken).toHaveBeenCalledWith(expectedPayload);
      expect(mockSessionService.createSession).toHaveBeenCalledWith(
        mockAccessCode,
        expectedPayload,
      );
    });
  });

  describe("Admin verify token", () => {
    const authCodeData = {
      email: "ashiz@gmail.com",
      code: "123456",
      expiresAt: new Date("2099-04-05T10:00:00Z"),
    } as unknown as IAuthCodeDocument;

    it("should throw error if email is not found AuthCode", async () => {
      mockAuthCodeRepository.getByEmail.mockResolvedValue(null);
      const result = authService.adminVerifyToken("testing@gmail.com", "12345");
      await expect(result).rejects.toThrow(
        "Invalid access code or it has expired",
      );
    });

    it("should throw invalid access code if access code does not match", async () => {
      mockAuthCodeRepository.getByEmail.mockResolvedValue(authCodeData);

      const result = authService.adminVerifyToken(
        "ashiz@gmail.com",
        "wrong-code",
      );

      await expect(result).rejects.toThrow("Invalid access code");
    });

    it("should return the token", async () => {
      mockAuthCodeRepository.getByEmail.mockResolvedValue(authCodeData);
      mockGenerateToken.mockResolvedValue("mocked-jwt-token");
      mockComparePassword.mockResolvedValue(true);
      const result = await authService.adminVerifyToken(
        "ashiz@gmail.com",
        "123456",
      );

      const adminData = {
        email: authCodeData.email,
        role: "admin",
        type: "access",
      };

      expect(mockGenerateToken).toHaveBeenCalledWith(adminData);
      expect(mockAuthCodeRepository.delete).toHaveBeenCalled();
      expect(result).toBe("mocked-jwt-token");
    });
  });
});
