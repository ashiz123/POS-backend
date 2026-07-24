import express from "express";
import { container } from "tsyringe";
import { TOKENS } from "../../config/tokens";
import { IPaymentController } from "./payment.types";
import { authWithBusinessHandler } from "../../middlewares/authWithBusinessHandler";
import { hasPermission } from "../../middlewares/hasPermission";
import { authHandler } from "../../middlewares/authHandler";

const router = express.Router();

const paymentController = container.resolve<IPaymentController>(
  TOKENS.PAYMENT_CONTROLLER,
);

router.get(
  "/transactions",
  authHandler,
  authWithBusinessHandler,
  hasPermission("handle_payment"),
  paymentController.transactions,
);

export default router;
