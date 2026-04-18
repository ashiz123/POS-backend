import { NextFunction, Request, Response } from "express";
import { TOKENS } from "../../config/tokens";
import { ITerminalController, ITerminalService } from "./terminal.type";
import { injectable, inject } from "tsyringe";
import {
  ApproveTerminalDTO,
  ApproveTerminalValidation,
  CreateTerminalDTO,
  CreateTerminalValidation,
} from "./terminal.validation";
import { NotFoundError, UnauthorizedError } from "../../errors/httpErrors";
import { ApiResponse } from "../../types/apiResponseType";
import { TerminalDocument } from "./terminal.model";
import { ITerminalSessionService } from "./terminalSession/terminalSession.type";
import { ITerminalSessionDocument } from "./terminalSession/terminalSession.model";

@injectable()
export class TerminalController implements ITerminalController {
  constructor(
    @inject(TOKENS.TERMINAL_SERVICE)
    private terminalService: ITerminalService,
    @inject(TOKENS.TERMINAL_SESSION_SERVICE)
    private terminalSessionService: ITerminalSessionService,
  ) {}

  createTerminal = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authenticated user not found");
      }

      const { businessId, userId } = req.user;
      const ownerId = userId;
      const parsedValidatedData: CreateTerminalDTO =
        CreateTerminalValidation.parse(req.body);
      const data = { ...parsedValidatedData, businessId, ownerId };
      const result = await this.terminalService.createTerminal(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  approveTerminal = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsedValidatedData: ApproveTerminalDTO =
        ApproveTerminalValidation.parse(req.body);

      if (!req.user) {
        throw new UnauthorizedError("Authenticated user not found");
      }

      if (req.user.role !== "admin") {
        throw new UnauthorizedError("Admin can only approve the terminal");
      }

      const { email } = req.user; //do validation

      const data = {
        ...parsedValidatedData,
        email,
      };
      const result = await this.terminalService.approveTerminal(data);
      const response: ApiResponse<TerminalDocument | null> = {
        success: true,
        data: result,
        message: "Terminal approved successfully",
      };
      res.status(200).json(response);
      return;
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  loginTerminal = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      console.log("login here");
      const { terminalId, email, pin } = req.body;
      const response = await this.terminalSessionService.terminalLogin(
        terminalId,
        email,
        pin,
      );

      res.status(200).json(response);

      return;
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  logoutTerminal = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new NotFoundError("User not found to create the user");
      }
      const { terminalSessionId } = req.user;
      console.log("terminal session id", terminalSessionId);

      await this.terminalSessionService.terminalLogout(terminalSessionId);

      const response: ApiResponse<boolean> = {
        success: true,
        message: "Terminal logout successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  allActiveTerminals = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error("Authenticated user not found");
      }
      console.log("uer", req.user);
      const { businessId } = req.user;
      console.log("businessId", businessId);
      const activeTerminals =
        await this.terminalService.findByBusinessId(businessId);
      const response: ApiResponse<TerminalDocument[]> = {
        success: true,
        data: activeTerminals,
      };
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
