import { ClientSession } from "mongoose";
import { ICrudRepository } from "../../shared/crudRepository";
import {
  ApproveTerminal,
  TerminalDocument,
  TerminalType,
  UpdateTerminalDTO,
} from "./terminal.model";
import { ApproveTerminalDTO, CreateTerminalDTO } from "./terminal.validation";
import { Request, Response, NextFunction } from "express";
import { RouteHandler } from "../../shared/baseType";
import { IBusinessDocument } from "../business/database/business_db_model";

export type PopulatedTerminal = TerminalDocument & {
  businessId: IBusinessDocument; // This replaces the ID with the actual object
};

export interface ITerminalAuthContext {
  activationCode: string;
  businessId: string;
  user: {
    _id: string;
    email: string;
  };
  membership: {
    role: string;
  };
}

export interface ITerminalRepository extends ICrudRepository<
  TerminalDocument,
  CreateTerminalDTO,
  UpdateTerminalDTO
> {
  createWithSession(
    data: CreateTerminalDTO,
    session: ClientSession,
  ): Promise<TerminalDocument>;
  changeTerminalStatus(data: ApproveTerminal): Promise<TerminalDocument | null>;
  getTerminalById(
    terminalId: string,
    businessId: string,
  ): Promise<TerminalDocument | null>;
  getTerminalsByBusinessId(businessId: string): Promise<TerminalDocument[]>;
  getBusiness(terminalId: string): Promise<PopulatedTerminal | null>;
  getAuthorizedContext(
    terminalId: string,
    email: string,
  ): Promise<ITerminalAuthContext>;
}

export interface ITerminalService {
  createTerminal(data: CreateTerminalDTO): Promise<TerminalDocument>;
  approveTerminal(
    data: ApproveTerminalDTO & { email: string },
  ): Promise<TerminalDocument | null>;
  findByBusinessId(businessId: string): Promise<TerminalDocument[]>;
}

export interface ITerminalController {
  createTerminal(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  approveTerminal(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  allActiveTerminals: RouteHandler;
  loginTerminal: RouteHandler;
  logoutTerminal: RouteHandler;
}
