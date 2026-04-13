import express from "express";
const router = express.Router();
import { authHandler } from "../../middlewares/authHandler.js";
import { container } from "tsyringe";
import { IAuthService } from "./interfaces/authInterface.js";
import { TOKENS } from "../../config/tokens.js";
import {
  registerUser,
  loginUser,
  getAuthUser,
  logoutUser,
  loginUserWithBusinessId,
  loginWithAcessToken,
} from "./auth.controller.js";

router.post("/register", (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return registerUser(authService)(req, res, next);
});
router.post("/login", (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return loginUser(authService)(req, res, next);
});
router.post("/loginWithBusiness", authHandler, (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return loginUserWithBusinessId(authService)(req, res, next);
});
router.get("/auth_user", authHandler, getAuthUser());

router.post("/logout", authHandler, (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return logoutUser(authService)(req, res, next);
});
router.post("/verifyOTP", (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return loginWithAcessToken(authService)(req, res, next);
});

export default router;
