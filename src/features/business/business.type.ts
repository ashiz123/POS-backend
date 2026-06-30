import { ClientSession } from "mongoose";
import { RouteHandler } from "../../shared/baseType";
import { ICrudController } from "../../shared/crudControllerInterface";
import {
  BusinessProps,
  BusinessPropsLean,
  CreateBusinessDTO,
  UpdateBusinessDTO,
} from "./business.model";
import { IBusinessDocument } from "./database/business_db_model";
import { ICrudRepository } from "../../shared/crudRepository";
import { ICrudService } from "../../shared/crudServiceInterface";

export type BusinessController = {
  list: RouteHandler;
  getById: RouteHandler;
  create: RouteHandler;
  update: RouteHandler;
  remove: RouteHandler;
};

export interface CreateBusinessRequest {
  nae: string;
  address: string;
  websisste?: string;
}

export interface IBusinessRepository extends ICrudRepository<
  IBusinessDocument,
  CreateBusinessDTO,
  UpdateBusinessDTO
> {
  filterByUserId(userId: string): Promise<IBusinessDocument[]>;
  filterByName(name: string): Promise<IBusinessDocument | null>;
  createWithSession(
    data: CreateBusinessDTO,
    session: ClientSession,
  ): Promise<IBusinessDocument>;
  findAndUpdateByToken(
    token: string,
    session: ClientSession,
  ): Promise<IBusinessDocument | null>;
}

export interface IBusinessService<T> extends ICrudService<BusinessProps> {
  filterBusinessByAuthUser(authId: string): Promise<T[]>;
  filterBusinessByName(name: string): Promise<T | null>;
  activateUser(
    token: string,
    userId: string,
    userEmail: string,
  ): Promise<boolean>;
  getActiveBusinesses(userId: string): Promise<BusinessPropsLean[]>;
}

export interface IBusinessController extends ICrudController {
  activateForm: RouteHandler;
  updateActivate: RouteHandler;
  getListsByAuthUser: RouteHandler;
}
