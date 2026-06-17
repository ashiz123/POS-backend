import { Document, Types } from "mongoose";

import {
  AccountType,
  AuthType,
  LoginFirstResponse,
  LoginResponse,
  LoginWithSelectBusinessDTO,
  PreAuthResponse,
  SelectBusinessResponse,
  UserRole,
} from "../auth.type.js";

export interface IUserProps {
  name: string;
  email: string;
  phone: string;
  password?: string;
  accountType: AccountType;
  new: boolean;
  is_verified: boolean;
  verificationToken?: string;
  verificationExpires?: Date;
  createdBy?: string | Types.ObjectId;
}

// export type IUser = HydratedDocument<IUserProps>

export interface IUserDocument extends Omit<IUserProps, "createdBy">, Document {
  _id: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// export type CreateEmployee
// export type registerUser
// export type loginUser

export interface IAuthService {
  registerUser(data: IUserProps): Promise<IUserDocument>;
  verifyRegister(token: string): Promise<IUserDocument>;
  generatePreAuthToken(email: string, password: string): Promise<string>;
  logout(token: string): Promise<boolean>;
  selectBusiness(
    data: LoginWithSelectBusinessDTO,
  ): Promise<SelectBusinessResponse>;
  generateAccessToken(
    preAuthToken: string,
    otp: string,
  ): Promise<LoginResponse>;
  generateNewAccessToken(refreshToken: string): Promise<string>;
}

export interface IAuthRepository {
  createUser(data: IUserProps): Promise<IUserDocument>;
  verifyUser(token: string): Promise<IUserDocument>;
  findByEmail(email: string): Promise<IUserDocument | null>;
}

export type Payload = {
  sub: string;
  email: string;
  role?: UserRole;
  name?: string;
  businessId?: string;
  terminalId?: string;
  isVerified?: boolean;
  status?: string;
  type?: AuthType;
  accountType?: AccountType;
  terminalSessionId?: string;
  sessionStatus?: string;
};

export interface JwtPayload {
  sub: string; // user id
  email: string;
  status?: string;
  name?: string;
  type?: AuthType;
  accountType?: AccountType;
  isVerified?: boolean;
  businessId?: string;
  terminalId?: string;
  terminalSessionId?: string;
  sessionStatus?: string;
  role: UserRole;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}
