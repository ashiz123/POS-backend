import express from "express";
import { container } from "tsyringe";
import { IDashboardController } from "./dashboard.types";
import { TOKENS } from "../../config/tokens";
import { authHandler } from "../../middlewares/authHandler";
import { authWithBusinessHandler } from "../../middlewares/authWithBusinessHandler";
import { hasPermission } from "../../middlewares/hasPermission";

const router = express.Router();
const dashboardController = container.resolve<IDashboardController>(
  TOKENS.DASHBOARD_CONTROLLER,
);

router.get(
  "/totalNetSales",
  authHandler,
  authWithBusinessHandler,
  hasPermission("view_dashboard"),
  dashboardController.totalNetSales,
);
router.get(
  "/bestSellingItem",
  authHandler,
  authWithBusinessHandler,
  hasPermission("view_dashboard"),
  dashboardController.bestSellingItem,
);
router.get(
  "/refundOrder",
  authHandler,
  authWithBusinessHandler,
  hasPermission("view_dashboard"),
  dashboardController.refundOrder,
);
router.get(
  "/voidOrder",
  authHandler,
  authWithBusinessHandler,
  hasPermission("view_dashboard"),
  dashboardController.voidOrder,
);
router.get(
  "/lowStock",
  authHandler,
  authWithBusinessHandler,
  hasPermission("view_dashboard"),
  dashboardController.lowStockProducts,
);
router.get(
  "/transactionToday",
  authHandler,
  authWithBusinessHandler,
  hasPermission("view_dashboard"),
  dashboardController.transactionToday,
);

export default router;
