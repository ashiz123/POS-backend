import { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { hashPassword } from "../../utils/password.js";
import { IUserDocument } from "./interfaces/authInterface.js";
import { USER_ROLE } from "./user.constant.js";

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

    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: false,
    },

    //not necessary
    activationToken: {
      type: String,
      required: false,
    },

    //not necessary
    new: {
      type: Boolean,
      default: true,
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
