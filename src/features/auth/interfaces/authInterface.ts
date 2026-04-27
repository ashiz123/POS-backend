import { Document, Types } from "mongoose";
import {
  LoginFirstResponse,
  LoginResponse,
  LoginWithSelectBusinessDTO,
} from "../types/LoginResponse.type.js";
import { AuthType, UserRole } from "../auth.type.js";

export interface IUserProps {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role?: "admin" | "owner" | "accountant" | "cashier" | "manager" | "employee";
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
  register(data: IUserProps): Promise<IUserDocument>;
  verify(token: string): Promise<IUserDocument>;
  login(
    email: string,
    password: string,
  ): Promise<IUserDocument | LoginFirstResponse>;
  logout(token: string): Promise<boolean>;
  loginWithSelectBusiness(
    data: LoginWithSelectBusinessDTO,
  ): Promise<LoginResponse>;
  adminVerifyToken(email: string, OTP: string): Promise<string>;
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
  businessId?: string;
  terminalId?: string;
  status?: string;
  type?: AuthType;
  terminalSessionId?: string;
  sessionStatus?: string;
};

export interface JwtPayload {
  sub: string; // user id
  email: string;
  status?: string;
  type?: AuthType;
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
