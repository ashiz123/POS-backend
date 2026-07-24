import express from "express";
import { container } from "tsyringe";
import { INotificationController } from "./notification.type";
import { TOKENS } from "../../config/tokens";
import { authWithBusinessHandler } from "../../middlewares/authWithBusinessHandler";
import { hasPermission } from "../../middlewares/hasPermission";
import { authHandler } from "../../middlewares/authHandler";

const router = express.Router();
const notificationController = container.resolve<INotificationController>(
  TOKENS.NOTIFICATION_CONTROLLER,
);

router.get(
  "/notifications",
  authHandler,
  authWithBusinessHandler,
  hasPermission("admin_dashboard"),
  notificationController.getAllNotifications,
);

export default router;
