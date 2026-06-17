import { IUserDocument, Payload } from "./interfaces/authInterface";
import { ACCOUNT_TYPE, AUTH_TYPE, USER_ROLE } from "./user.constant";

export type AccountType = (typeof ACCOUNT_TYPE)[keyof typeof ACCOUNT_TYPE];

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export type AuthType = (typeof AUTH_TYPE)[keyof typeof AUTH_TYPE];

export type PreAuthResponse = {
  id: string;
  name: string;
  email: string;
  accountType: string;
  isVerified: boolean;
};

export type PreAuthPayload = {
  sub: string;
  email: string;
  name?: string;
  type: AuthType;
  accountType: AccountType;
  isVerified: boolean;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  authData: PreAuthPayload;
};

export type SelectBusinessResponse = {
  // id?: Types.ObjectId
  email: string;
  token: string;
};

export type UserBusiness = {
  businessId: string;
  role: string;
  userStatus: "pending" | "active" | "disabled";
};

export type LoginFirstResponse = {
  email?: string;
  role?: UserRole;
  otp?: string;
  accessToken: string;
  refreshToken?: string;
  userData?: PreAuthResponse;
  businesses?: UserBusiness[];
};

export type PreAuthType = {
  sub: string;
  email: string;
  type: string;
};

export type LoginWithSelectBusinessDTO = {
  userId: string;
  email: string;
  type?: string;
  businessId: string;
};
