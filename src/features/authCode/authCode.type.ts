import { Document } from "mongoose";

export interface IAuthCode {
  email: string;
  code: string;
  expiresAt: Date;
}

export interface IAuthCodeDocument extends IAuthCode, Document {
  created_at: Date;
  updated_at: Date;
}

export interface IAuthCodeRepository {
  create(data: IAuthCode): Promise<IAuthCodeDocument>;
  getByEmail(
    email: string,
    hashedOtp: string,
  ): Promise<IAuthCodeDocument | null>;
  delete(id: string): Promise<void>;
}
