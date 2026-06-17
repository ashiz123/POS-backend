import { Request, Response, NextFunction } from "express";
import { IUserProps, type IAuthService } from "./interfaces/authInterface.js";
import { RegisterSchemaValidation } from "./validations/RegisterSchemaValidation.js";
import {
  LoginSchemaValidation,
  LoginWithBusinessValidation,
} from "./validations/LoginSchemaValidation.js";
import { setCookies, unSetCookies } from "../../utils/cookieHelper.js";
import { UnauthorizedError } from "../../errors/httpErrors.js";
import { ACCOUNT_TYPE } from "./user.constant.js";

//business register
export const registerUser =
  (authService: IAuthService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = RegisterSchemaValidation.parse(req.body);
      const userData = {
        ...data,
        accountType: ACCOUNT_TYPE.BUSINESS,
      };
      const result = await authService.registerUser(userData as IUserProps);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

//admin register
export const registerAdmin =
  (authService: IAuthService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = RegisterSchemaValidation.parse(req.body);
      const adminData = {
        ...data,
        accountType: ACCOUNT_TYPE.ADMIN,
      };
      const result = await authService.registerUser(adminData as IUserProps);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

//Verify user through email
export const verifyRegisterUser =
  (authService: IAuthService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params as { token: string };
      await authService.verifyRegister(token);
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

//Login user with email and password
export const loginUser =
  (authService: IAuthService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = LoginSchemaValidation.parse(req.body);
      const { email, password } = data;

      const preAuth: string = await authService.generatePreAuthToken(
        email,
        password,
      );

      if (preAuth) {
        setCookies(res, "preAuthToken", preAuth);
      }

      res.status(200).json({
        Message: "Check your email for otp to verify",
        mfa_required: true,
      });

      return;
    } catch (error) {
      next(error);
    }
  };

//verify user with otp sent to their mail before login
export const verifyUserWithOTP =
  (authService: IAuthService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const preAuthToken = req.cookies.preAuthToken;

      if (!preAuthToken) {
        return res
          .status(401)
          .json({ message: "User not authorized, Token required" });
      }

      const { otp } = req.body;

      const { accessToken, refreshToken, authData } =
        await authService.generateAccessToken(preAuthToken, otp);

      if (accessToken && refreshToken) {
        // setAuthCookies(res, accessToken, refreshToken);
        setCookies(res, "accessToken", accessToken, 1);
        setCookies(res, "refreshToken", refreshToken, 7 * 60); //cookies set for 7 hour
        unSetCookies(res, "preAuthToken");
      }

      return res.status(200).json({
        message: "User logged in successfully",
        userData: {
          id: authData.sub,
          email: authData.email,
          accountType: authData.accountType,
          isVerified: authData.isVerified,
        },
      });
    } catch (error) {
      console.error("OTP Verification Error:", error);
      next(error); // Pass to global error handler
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

      const result = await authService.selectBusiness(data);
      setCookies(res, "businessToken", result.token, 300);
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
    // const token = req.headers.authorization?.split(" ")[1] || "";
    // const result = await authService.logout(token);
    // if (!result) {
    //   logger.error("Logout user failed");
    //   return next(new Error("Logout failed"));
    // }

    // res.status(200).json({ message: "User logged out successfully" });
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    res.clearCookie("businessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    res.clearCookie("preAuthToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });

    return;
  };

export const refreshSession =
  (authService: IAuthService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw new UnauthorizedError("Session Denied");
    }

    try {
      const newAccessToken: string =
        await authService.generateNewAccessToken(refreshToken);
      setCookies(res, "accessToken", newAccessToken, 1);

      return res.status(200).json({
        success: true,
        message: "Token refreshed",
        token: newAccessToken,
      });
    } catch (error) {
      next(error);
    }
  };
