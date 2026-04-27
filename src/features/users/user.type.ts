import { ClientSession } from "mongoose";

import { ICrudRepository } from "../../shared/crudRepository";
import { IUserDocument, IUserProps } from "../auth/interfaces/authInterface";
import { ICrudController } from "../../shared/crudControllerInterface.ts";

import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../types/apiResponseType.ts";

export interface CreateUserDTO {
  name: string;
  email: string;
  phone: string;
  role: string;
  address: string;
  businessId: string;
  activationToken?: string;
}

export type UpdateUserDTO = Partial<Omit<CreateUserDTO, "activationToken">>;

export type IUserRepository = ICrudRepository<
  IUserDocument,
  CreateUserDTO,
  UpdateUserDTO
> & {
  findAndUpdateByTokenWithSession(
    token: string,
    hashedPassword: string,
    session: ClientSession,
  ): Promise<IUserDocument | null>;

  getAdmin(): Promise<IUserDocument | null>;
  getAllAdmin(): Promise<IUserDocument[]>;
  createUserWithSession(
    userData: CreateUserDTO,
    session: ClientSession,
  ): Promise<{ user: IUserDocument; newUser: boolean }>;
};

export type IUserService = {
  // activateUser(token: string, password: string): Promise<IUserProps | null>
  createUser(newUser: CreateUserDTO, createdBy: string): Promise<IUserDocument>;
  activateUserWithPassword(
    businessId: string,
    token: string,
    password: string,
  ): Promise<IUserDocument | null>;
  activateUserWithoutPassword(
    userId: string,
    businessId: string,
    role?: string,
  ): Promise<boolean>;

  getUserById(id: string): Promise<IUserProps | null>;
};

export interface IUserController extends ICrudController {
  // Create a new user
  create: (
    req: Request,
    res: Response<ApiResponse<IUserProps>>,
    next: NextFunction,
  ) => Promise<void>;

  // Show the set-password form (activation form)
  activateFormWithPassword: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;

  // Activate user account and set password
  updateActivate: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;
}
