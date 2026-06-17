import express from "express";
import { authWithBusinessHandler } from "../../../middlewares/authWithBusinessHandler";
import { hasPermission } from "../../../middlewares/hasPermission";
import { authHandler } from "../../../middlewares/authHandler";

import { container } from "tsyringe";
import { TOKENS } from "../../../config/tokens";
import { IOrderController } from "../order.type";

const router = express.Router();

const orderController = container.resolve<IOrderController>(
  TOKENS.ORDER_CONTROLLER,
);

router.get(
  "/list",
  authHandler,
  authWithBusinessHandler,
  hasPermission("view_orders"),
  orderController.getOrderByBusiness,
);

export default router;
