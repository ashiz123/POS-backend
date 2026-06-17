import { NextFunction, Request, Response } from "express";
import { TOKENS } from "../../config/tokens";
import { ITerminalController, ITerminalService } from "./terminal.interface";
import { injectable, inject } from "tsyringe";
import {
  ApproveTerminalDTO,
  ApproveTerminalValidation,
  CreateTerminalDTO,
  CreateTerminalValidation,
} from "./terminal.validation";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../errors/httpErrors";
import { ApiResponse } from "../../types/apiResponseType";
import { TerminalDetail, TerminalDocument } from "./terminal.model";
import { ITerminalSessionService } from "./terminalSession/terminalSession.type";
import { setCookies } from "../../utils/cookieHelper";
import { TerminalUserSessionResponse } from "./terminal.type";

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
      res.status(201).json({ success: true, data: result });
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

      if (req.user.accountType !== "admin") {
        throw new UnauthorizedError("Admin can only approve the terminal");
      }

      const { email } = req.user; //do validation

      const data = {
        ...parsedValidatedData,
        email,
      };

      const approveTerminal = await this.terminalService.approveTerminal(data);

      if (!approveTerminal) {
        throw new BadRequestError("Terminal is not approved");
      }

      const response: ApiResponse<any> = {
        success: true,
        message: "Terminal approved successfully",
      };
      res.status(200).json(response);
      return;
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  activateTerminal = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { activationCode } = req.body;

    try {
      const { deviceAccessToken, deviceRefreshToken } =
        await this.terminalService.activateTerminal(activationCode);

      if (!deviceAccessToken) {
        throw new NotFoundError("Device access Token not found");
      }

      if (!deviceRefreshToken) {
        throw new NotFoundError("Device refresh Token not found");
      }

      setCookies(res, "deviceA_token", deviceAccessToken, 1); //cookies for 1 hour
      setCookies(res, "deviceR_token", deviceRefreshToken, 365 * 24 * 60); //cookies for 1 year

      res.status(200).json({
        success: true,
        message: "Terminal/Kiosk activated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  loginTerminal = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, password } = req.body;
      const deviceAccessToken = req.cookies.deviceA_token;
      // const deviceRefreshToken = req.cookies.deviceR_token;

      if (!deviceAccessToken) {
        throw new UnauthorizedError(
          "Device access token not found or expired",
          "DEVICE_EXPIRED",
        );
      }

      const { sessionAccessToken, sessionRefreshToken, user } =
        await this.terminalSessionService.terminalLogin(
          email,
          password,
          deviceAccessToken,
        );

      setCookies(res, "t_u_access_token", sessionAccessToken, 10); //setting access cookies for 1 hour
      setCookies(res, "t_u_refresh_token", sessionRefreshToken, 60 * 24); //setting refresh cookies for 1 day

      res.status(200).json({ data: user });

      return;
    } catch (error) {
      console.log("error before next", error);
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

  getTerminalData = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { businessId, terminalId } = req.terminal as {
      businessId: string;
      terminalId: string;
    };

    try {
      const terminalDetail = await this.terminalService.findByIdAndBusinessId(
        terminalId,
        businessId,
      );
      const response: ApiResponse<TerminalDetail | null> = {
        success: true,
        data: terminalDetail,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getTerminalSessionUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { userId, email, name, role, terminalSessionId } =
        req.terminalUser as {
          userId: string;
          email: string;
          name: string;
          role: string;
          terminalSessionId: string;
        };
      const { businessId } = req.terminal as { businessId: string };

      console.log("businessId", businessId);

      const response: ApiResponse<TerminalUserSessionResponse> = {
        success: true,
        data: {
          userData: {
            userId,
            email,
            name,
            role,
          },
          terminalSessionId,
          businessId,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  refreshDeviceSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    console.log("it comes here");
    const { deviceR_token } = req.cookies;
    if (!deviceR_token) {
      throw new UnauthorizedError(
        "Refresh session token does not exist",
        "REFRESH_TOKEN_NOT_EXIST",
      );
    }

    try {
      const deviceAccessToken =
        await this.terminalService.generateNewDeviceToken(deviceR_token);

      setCookies(res, "deviceA_token", deviceAccessToken, 3);
      res.status(200).json({
        message: "Device access token set successfully using refresh token",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  refreshUserSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { t_u_refresh_token } = req.cookies;
    if (!t_u_refresh_token) {
      throw new Error("Refresh session token does not exist");
    }

    try {
      const deviceAccessToken =
        await this.terminalSessionService.generateSessionToken(
          t_u_refresh_token,
        );

      setCookies(res, "t_u_access_token", deviceAccessToken, 10);
      res.status(200).json({
        message: "Device access token set successfully using refresh token",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
