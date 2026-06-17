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
} from "./auth.controller.js";

// const withAuth = (callback: (service: IAuthService) => any) => {
//   return (req: any, res: any, next: any) => {
//     const service = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
//     return callback(service)(req, res, next);
//   };
// };
// router.post("/register", withAuth(registerUser));
// router.get("/verify/:token", withAuth(verifyRegisterUser));
// router.post("/login", withAuth(loginUser));
// router.get("/user", authHandler, withAuth(getAuthUser));
// router.delete("/logout", withAuth(logoutUser));
// router.get("/refresh-session", withAuth(refreshSession));
// router.post("/loginWithBusinessId", withAuth(loginUserWithBusinessId));
// router.post("/verifyOTP", withAuth(verifyUserWithOTP)

//register new user
router.post("/register", (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return registerUser(authService)(req, res, next);
});

//this goes to user email, to verify email is valid and of right user
router.get("/verifyUser/:token", (req, res, next) => {
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
router.post("/verifyOTP", (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return verifyUserWithOTP(authService)(req, res, next);
});

//refresh token
router.post("/refreshSession", (req, res, next) => {
  const authService = container.resolve<IAuthService>(TOKENS.AUTH_SERVICE);
  return refreshSession(authService)(req, res, next);
});

router.get("/authUser", authHandler, getAuthUser());

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
