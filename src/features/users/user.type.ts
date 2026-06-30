import { ClientSession } from "mongoose";
import { ICrudRepository } from "../../shared/crudRepository";
import { IUserDocument, IUserProps } from "../auth/interfaces/authInterface";
import { Request, Response, NextFunction } from "express";
import { TerminalLoginType } from "../terminal/terminal.model";
import { ITerminalAuthData } from "../terminal/terminal.type";
import { ICrudController } from "../../shared/crudControllerInterface";
import { ApiResponse } from "../../types/apiResponseType";
import { RouteHandler } from "../../shared/baseType";

export interface CreateUserDTO {
  name: string;
  email: string;
  phone: string;
  role: string;
  address: string;
  businessId: string;
  verificationToken?: string;
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
  getUserByBusinessId(businessId: string): Promise<IUserProps[]>;
  getAuthorizedContext(
    terminalLoginData: TerminalLoginType,
  ): Promise<ITerminalAuthData>;
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
  getUserByBusiness(businessId: string): Promise<IUserProps[]>;
};

export interface IUserController extends ICrudController {
  // Create a new user
  create: (
    req: Request,
    res: Response<ApiResponse<IUserProps>>,
    next: NextFunction,
  ) => Promise<void>;

  // Show the set-password form (activation form)
  activateFormWithPassword: RouteHandler;

  // Activate user account and set password
  updateActivate: RouteHandler;

  listByBusiness: RouteHandler;
}
