import { createCrudRoutes } from "../../shared/baseRouter";
import { authWithBusinessHandler } from "../../middlewares/authWithBusinessHandler";
import { hasPermission } from "../../middlewares/hasPermission";
import { authHandler } from "../../middlewares/authHandler";
import { container } from "tsyringe";
import { IProductController } from "./product.type";
import { TOKENS } from "../../config/tokens";
import { uploadImage } from "../../middlewares/uploadFile";
import { uploadAndOptimizeImage } from "../../middlewares/uploadCompressFile";

const productController = container.resolve<IProductController>(
  TOKENS.PRODUCT_CONTROLLER,
);

export default createCrudRoutes(productController, {
  exclude: [],
  middleware: [
    authHandler,
    authWithBusinessHandler,
    hasPermission("handle_product"),
  ],

  overrideRoute: {
    list: [authHandler, authWithBusinessHandler, hasPermission("view_product")],
    create: [
      authHandler,
      authWithBusinessHandler,
      hasPermission("handle_product"),
      uploadAndOptimizeImage("products"),
    ],
    update: [
      authHandler,
      authWithBusinessHandler,
      hasPermission("handle_product"),
      uploadAndOptimizeImage("products"),
    ],
  },

  additionalRoute: [
    {
      name: "getByCategoryId",
      method: "get",
      path: "/ofCategory/:id",
      handler: productController.filterByCategory,
    },
  ],
});
