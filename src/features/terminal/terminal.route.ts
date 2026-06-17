import express from "express";
import { container } from "tsyringe";
import { ITerminalController } from "./terminal.interface";
import { TOKENS } from "../../config/tokens";
import { authWithBusinessHandler } from "../../middlewares/authWithBusinessHandler";
import { hasPermission } from "../../middlewares/hasPermission";
import { authHandler } from "../../middlewares/authHandler";
import { requireDevice } from "../../middlewares/requireDevice";
import { kioskAuthHandler } from "../../middlewares/kioskAuthHanlder";

const terminalController = container.resolve<ITerminalController>(
  TOKENS.TERMINAL_CONTROLLER,
);

const router = express.Router();

//BUSINESS OR ADMIN ROUTES
// Request for terminal
router.post(
  "/create",
  authWithBusinessHandler,
  hasPermission("create_terminal"),
  terminalController.createTerminal,
);

router.get(
  "/all-terminals",
  authWithBusinessHandler,
  hasPermission("create_terminal"),
  terminalController.allActiveTerminals,
);

// Appove the terminal
router.post(
  "/approve",
  authHandler,
  hasPermission("approve_terminal"),
  terminalController.approveTerminal,
);

//KIOSK OR CUSTOMER ROUTES

//Activate the terminal.
router.post("/activate", terminalController.activateTerminal);

router.post("/refresh-device", terminalController.refreshDeviceSession);

router.post("/refresh-session", terminalController.refreshUserSession);

router.get(
  "/get-terminal-detail",
  requireDevice,
  terminalController.getTerminalData,
);

router.get(
  "/get-terminal-user-session",
  requireDevice,
  kioskAuthHandler,
  terminalController.getTerminalSessionUser,
);

router.post("/login", terminalController.loginTerminal);

router.post("/logout", authHandler, terminalController.logoutTerminal);

export default router;
