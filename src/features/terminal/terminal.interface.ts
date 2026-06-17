import { ClientSession } from "mongoose";
import { ICrudRepository } from "../../shared/crudRepository";
import {
  ApproveTerminal,
  ApproveTerminalData,
  TerminalDetail,
  TerminalDocument,
  TerminalLoginType,
  UpdateTerminalDTO,
} from "./terminal.model";
import { ApproveTerminalDTO, CreateTerminalDTO } from "./terminal.validation";
import { Request, Response, NextFunction } from "express";
import { RouteHandler } from "../../shared/baseType";
import { ITerminalAuthContext, PopulatedTerminal } from "./terminal.type";

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
  getTerminalByActivationCodeAndUpdate(
    activationCode: string,
  ): Promise<TerminalDocument | null>;
  getTerminalByIdAndBusinessId(
    terminalId: string,
    businessId: string,
  ): Promise<TerminalDocument | null>;
  getTerminalsByBusinessId(businessId: string): Promise<TerminalDocument[]>;
  getBusiness(terminalId: string): Promise<PopulatedTerminal | null>;
  // getAuthorizedContext(
  //   terminalLoginData: TerminalLoginType,
  // ): Promise<ITerminalAuthContext>;
}

export interface ITerminalService {
  createTerminal(data: CreateTerminalDTO): Promise<TerminalDocument>;
  approveTerminal(
    data: ApproveTerminalDTO & { email: string },
  ): Promise<boolean>;
  activateTerminal(activationCode: string): Promise<ApproveTerminalData>;
  findByBusinessId(businessId: string): Promise<TerminalDocument[]>;
  findByIdAndBusinessId(
    terminalId: string,
    businessId: string,
  ): Promise<TerminalDetail | null>;
  generateNewDeviceToken(deviceRefreshToken: string): Promise<string>;
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
  activateTerminal: RouteHandler;
  allActiveTerminals: RouteHandler;
  loginTerminal: RouteHandler;
  logoutTerminal: RouteHandler;
  getTerminalData: RouteHandler;
  getTerminalSessionUser: RouteHandler;
  refreshDeviceSession: RouteHandler;
  refreshUserSession: RouteHandler;
}
