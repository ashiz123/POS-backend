import { Request, Response, NextFunction } from "express";
import { IUserProps, type IAuthService } from "./interfaces/authInterface.js";
import { RegisterSchemaValidation } from "./validations/RegisterSchemaValidation.js";
import {
  LoginSchemaValidation,
  LoginWithBusinessValidation,
} from "./validations/LoginSchemaValidation.js";
import { logger } from "../../middlewares/logHandler.js";
import { AuthService } from "./auth.service.js";
import { LoginFirstResponse } from "./types/LoginResponse.type.js";
import { setAuthCookies, setRefreshCookies } from "../../utils/cookieHelper.js";
import { UnauthorizedError } from "../../errors/httpErrors.js";

export const registerUser =
  (authService: IAuthService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = RegisterSchemaValidation.parse(req.body);
      const result = await authService.register(data as IUserProps);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

export const verifyUser =
  (authService: IAuthService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params as { token: string };
      await authService.verify(token);
      return res.send(`
              <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                <h1 style="color: #10b981;">Verification Successful!</h1>
                <p>Your email has been verified. You can now close this tab and log in to the app.</p>
                <a href="http://localhost:5173/login" style="color: #3b82f6; text-decoration: none;">Go to Login</a>
              </div>
            `);
    } catch (error) {
      next(error);
    }
  };

export const loginUser =
  (authService: IAuthService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = LoginSchemaValidation.parse(req.body);
      const { email, password } = data;
      const { accessToken, refreshToken, userData }: LoginFirstResponse =
        await authService.login(email, password);

      if (!accessToken || !refreshToken) {
        throw new UnauthorizedError(
          "Authentication failed: Access token or refresh token not found",
        );
      }

      setAuthCookies(res, accessToken, refreshToken);

      return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        data: { user: userData },
      });
    } catch (err) {
      next(err);
    }
  };

export const getAuthUser =
  () => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loggedInUser = req.user;
      res.status(200).json({ loggedInUser });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

export const loginUserWithBusinessId =
  (authService: IAuthService) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const request = LoginWithBusinessValidation.parse(req.body);
      const businessId = request.businessId;

      if (!req.user) {
        throw new Error("user not found");
      }
      const { userId, email } = req.user;

      console.log("userbusiness", userId, businessId);

      const data = {
        userId,
        email,
        businessId,
      };

      const result = await authService.loginWithSelectBusiness(data);

      res.status(200).json({
        success: true,
        message: "User logged in successfully with business",
        data: result,
      });
      return;
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

export const logoutUser =
  (authService: IAuthService) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1] || "";
    const result = await authService.logout(token);
    if (!result) {
      logger.error("Logout user failed");
      return next(new Error("Logout failed"));
    }

    res.status(200).json({ message: "User logged out successfully" });
  };

export const refreshSession =
  (authService: AuthService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({
        message: "Session denied. Please login again",
      });
    }

    const newAccessToken: string =
      await authService.setRefreshToken(refreshToken);

    setRefreshCookies(res, newAccessToken);

    return res.status(200).json({ success: true, message: "Token refreshed" });
  };

export const loginWithAcessToken =
  (authService: IAuthService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, otp } = req.body;
      console.log(otp);
      //do the validations
      const result = await authService.adminVerifyToken(email, otp);
      res.status(200).json({
        success: true,
        message: "User logged in successfully with business",
        data: result,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
