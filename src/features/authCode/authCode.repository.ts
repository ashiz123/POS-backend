import { inject, injectable } from "tsyringe";
import { Model } from "mongoose";
import {
  IAuthCode,
  IAuthCodeDocument,
  IAuthCodeRepository,
} from "./authCode.type";
import { TOKENS } from "../../config/tokens";

@injectable()
export class AuthCodeRepository implements IAuthCodeRepository {
  constructor(
    @inject(TOKENS.AUTHCODE_MODEL) private _model: Model<IAuthCodeDocument>,
  ) {}

  async create(data: IAuthCode): Promise<IAuthCodeDocument> {
    try {
      return this._model.create(data);
    } catch (error: any) {
      throw new Error("Database error to create the auth code", {
        cause: error,
      });
    }
  }

  async getByEmail(
    email: string,
    hashedOtp: string,
  ): Promise<IAuthCodeDocument | null> {
    try {
      return await this._model.findOne({
        email,
        code: hashedOtp,
        expiresAt: { $gt: new Date() },
      });
    } catch (error: any) {
      throw new Error("Database error to create the auth code", {
        cause: error,
      });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this._model.deleteOne({ _id: id });
      return;
    } catch (error: any) {
      throw new Error("Database Error ", {
        cause: error,
      });
    }
  }
}
