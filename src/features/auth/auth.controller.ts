import { Request, Response, NextFunction } from "express";
import { IUserProps, type IAuthService } from "./interfaces/authInterface.js";
import { RegisterSchemaValidation } from "./validations/RegisterSchemaValidation.js";
import {
  LoginSchemaValidation,
  LoginWithBusinessValidation,
} from "./validations/LoginSchemaValidation.js";
import { setCookies, unSetCookies } from "../../utils/cookieHelper.js";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../errors/httpErrors.js";
import { ACCOUNT_TYPE } from "./user.constant.js";
import { ForgetPasswordValidation } from "./validations/FogetPasswordValidation.js";
import { formForgetPassword } from "../../utils/setPasswordForm.js";
import { ResetPasswordValidation } from "./validations/ResetPasswordValidation.js";

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
        setCookies(res, "accessToken", accessToken, 10);
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
      const { businessId } = request;

      if (!req.user) {
        throw new Error("user not found");
      }
      const { userId, email } = req.user;

      const data = {
        userId,
        email,
        businessId,
      };

      const result = await authService.selectBusiness(data);
      setCookies(res, "businessToken", result.token, 300); //expires in 5 days
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
    const isProduction: boolean = process.env.NODE_ENV === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
      path: "/",
      partitioned: isProduction,
    };

    const tokensToClear = [
      "accessToken",
      "refreshToken",
      "businessToken",
      "preAuthToken",
    ];

    tokensToClear.forEach((tokenName) => {
      res.clearCookie(tokenName, cookieOptions);
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });

    return;
  };

export const forgetPassword =
  (authService: IAuthService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = ForgetPasswordValidation.parse(req.body);
      const { email } = data;

      const response = await authService.forgetPassword(email);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

export const resetPasswordForm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.params.token as string;

    if (!token) {
      throw new NotFoundError("No token found");
    }

    res.send(formForgetPassword(token));
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const resetPassword =
  (authService: IAuthService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = ResetPasswordValidation.parse(req.body);

      const { newPassword, confirmPassword, token } = data;

      if (newPassword !== confirmPassword) {
        return new ConflictError("Password not matched");
      }

      await authService.resetPassword(token, newPassword);
      return res
        .status(200)
        .json({ success: true, message: "Password reset successfully" });
    } catch (err) {
      console.log(err);
      next(err);
    }
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
      setCookies(res, "accessToken", newAccessToken, 10);

      return res.status(200).json({
        success: true,
        message: "Token refreshed",
        token: newAccessToken,
      });
    } catch (error) {
      next(error);
    }
  };
