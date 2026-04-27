import express from "express";
const router = express.Router();
import { authHandler } from "../../middlewares/authHandler.js";
import { container } from "tsyringe";
import { IAuthService } from "./interfaces/authInterface.js";
import { TOKENS } from "../../config/tokens.js";
import {
  registerUser,
  verifyUser,
  loginUser,
  getAuthUser,
  logoutUser,
  refreshSession,
  loginUserWithBusinessId,
  loginWithAcessToken,
} from "./auth.controller.js";

//register new user
router.post("/register", (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return registerUser(authService)(req, res, next);
});

//this goes to user email, to verify email is valid and of right user
router.get("/verifyUser/:token", (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return verifyUser(authService)(req, res, next);
});

//Login user , get access token
router.post("/login", (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return loginUser(authService)(req, res, next);
});

//refresh token
router.post("/refresh", (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return refreshSession(authService)(req, res, next);
});

router.get("/auth_user", authHandler, getAuthUser());

router.post("/logout", authHandler, (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return logoutUser(authService)(req, res, next);
});

//User login with business, that add businessId in middleware
router.post("/loginWithBusiness", authHandler, (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return loginUserWithBusinessId(authService)(req, res, next);
});

//verify by otp to admin while login.
router.post("/verifyOTP", (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return loginWithAcessToken(authService)(req, res, next);
});

export default router;
