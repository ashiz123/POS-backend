import { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { hashPassword } from "../../utils/password.js";
import { IUserDocument } from "./interfaces/authInterface.js";
import { ACCOUNT_TYPE } from "./user.constant.js";

//UserClass and AuthClass is use same schema
export const UserSchema: Schema<IUserDocument> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    accountType: {
      type: String,
      enum: ACCOUNT_TYPE,
      Default: ACCOUNT_TYPE.BUSINESS,
    },

    password: {
      type: String,
      required: false,
    },

    //admin using verification token
    verificationToken: {
      type: String,
      required: false,
      index: true,
    },

    verificationExpires: {
      type: Date,
      required: false,
    },

    new: {
      type: Boolean,
      default: true,
      required: true,
    },

    //this must be isVerified
    is_verified: {
      type: Boolean,
      default: false,
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);
//hashing the password
UserSchema.pre<IUserDocument>("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (this.password) {
    this.password = await hashPassword(this.password);
  }
  next();
});

//comparing the password first
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};
