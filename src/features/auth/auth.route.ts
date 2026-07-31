import express from "express";
const router = express.Router();
import { authHandler } from "../../middlewares/authHandler.js";
import { container } from "tsyringe";
import { IAuthService } from "./interfaces/authInterface.js";
import { TOKENS } from "../../config/tokens.js";
import {
  registerUser,
  verifyRegisterUser,
  loginUser,
  getAuthUser,
  logoutUser,
  refreshSession,
  loginUserWithBusinessId,
  verifyUserWithOTP,
  forgetPassword,
  resetPassword,
  resetPasswordForm,
} from "./auth.controller.js";

//register new user
router.post("/register", (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return registerUser(authService)(req, res, next);
});

//this goes to user email, to verify email is valid and of right user
router.get("/verify-user/:token", (req, res, next) => {
  return verifyRegisterUser(
    container.resolve<IAuthService>(TOKENS.AUTH_SERVICE),
  )(req, res, next);
});

//send OTP to user email
router.post("/login", (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return loginUser(authService)(req, res, next);
});

//verify OTP
router.post("/verify-otp", (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return verifyUserWithOTP(authService)(req, res, next);
});

//refresh token
router.post("/refreshSession", (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return refreshSession(authService)(req, res, next);
});

router.get("/auth-user", authHandler, getAuthUser());

router.post("/forget-password", (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return forgetPassword(authService)(req, res, next);
});

router.get("/reset-password/:token", (req, res, next) => {
  return resetPasswordForm(req, res, next);
});

router.post("/reset-password", (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return resetPassword(authService)(req, res, next);
});

router.post("/logout", authHandler, (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return logoutUser(authService)(req, res, next);
});

//User login with business, that add businessId in middleware
router.post("/loginWithBusiness", authHandler, (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return loginUserWithBusinessId(authService)(req, res, next);
});

export default router;
