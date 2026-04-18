import express from "express";
import { authHandler } from "../../middlewares/authHandler.js";
import { hasPermission } from "../../middlewares/hasPermission.js";
import { CategoryController } from "./category.controller";
import { categoryService } from "./category.service";
import { userAuthorityBusiness } from "../../middlewares/businessAccess.js";

const categoryController = new CategoryController(categoryService);

const router = express.Router();

router.get(
  "/",
  authHandler,
  hasPermission("handle_product"),
  categoryController.getAllCatgories,
);
router.post(
  "/create",
  authHandler,
  userAuthorityBusiness,
  hasPermission("handle_product"),
  categoryController.createCategory,
);
router.put("/update/:id", categoryController.updateCategory);
router.delete("/delete/:id", categoryController.deleteCategory);

export default router;
