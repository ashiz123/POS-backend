import { IUserDocument, IUserProps } from "./interfaces/authInterface.js";
import { IAuthRepository } from "./interfaces/authInterface.js";
import User from "./auth.model.js";
import { isMongoDuplicateKeyError } from "../../errors/guard.js";
import { BadRequestError, DuplicateEntry } from "../../errors/httpErrors.js";
import { injectable } from "tsyringe";

@injectable()
export class AuthRepository implements IAuthRepository {
  async createUser(data: IUserProps): Promise<IUserDocument> {
    try {
      const newUser = await User.create(data);
      return newUser;
    } catch (err: unknown) {
      if (isMongoDuplicateKeyError(err)) {
        throw new DuplicateEntry();
      }
      throw err;
    }
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    const user = await User.findOne({ email });
    return user;
  }

  async verifyUser(token: string): Promise<IUserDocument> {
    const user = await User.findOneAndUpdate(
      {
        verificationToken: token,
        verificationExpires: { $gt: Date.now() },
        is_verified: false,
      },
      {
        $set: { is_verified: true },
        $unset: {
          verificationToken: "",
          verificationExpires: "",
        },
      },
      { new: true },
    );

    if (!user) {
      throw new BadRequestError("Link is invalid or expired");
    }

    return user;
  }
}
