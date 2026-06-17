import { container } from "tsyringe";
import { TOKENS } from "../../../config/tokens";
import { IBusinessController } from "../business.type";
import express from "express";
import { authHandler } from "../../../middlewares/authHandler";
import { authWithBusinessHandler } from "../../../middlewares/authWithBusinessHandler";

const router = express.Router();

router.get("/", authHandler, authWithBusinessHandler, (req, res, next) => {
  const businessController = container.resolve<IBusinessController>(
    TOKENS.BUSINESS_CONTROLLER,
  );
  return businessController.getById(req, res, next);
});

export default router;
