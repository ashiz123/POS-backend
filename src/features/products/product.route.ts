import { createCrudRoutes } from "../../shared/baseRouter";
import { productController } from "./product.controller";
import { authWithBusinessHandler } from "../../middlewares/authWithBusinessHandler";
import { hasPermission } from "../../middlewares/hasPermission";

export default createCrudRoutes(productController, {
  exclude: [],
  middleware: [authWithBusinessHandler, hasPermission("handle_product")],
  additionalRoute: [
    {
      name: "getByCategoryId",
      method: "get",
      path: "/ofCategory/:id",
      handler: productController.filterByCategory,
    },
  ],
});
