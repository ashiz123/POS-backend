import express from "express";
import { requireDevice } from "../../middlewares/requireDevice";
import { kioskAuthHandler } from "../../middlewares/kioskAuthHanlder";
import { container } from "tsyringe";
import { IMenuController } from "./kiosk.type";
import { TOKENS } from "../../config/tokens";

const router = express.Router();

const menuController = container.resolve<IMenuController>(
  TOKENS.MENU_CONTROLLER,
);

router.get(
  "/categories",
  requireDevice,
  kioskAuthHandler,
  menuController.getAllActiveCategories,
);

router.get(
  "/productByCategory/:categoryId",
  requireDevice,
  kioskAuthHandler,
  menuController.getProductsByCategory,
);

export default router;
