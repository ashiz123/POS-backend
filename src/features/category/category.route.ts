import { hasPermission } from "../../middlewares/hasPermission.js";
import { container, DependencyContainer } from "tsyringe";
import { ICategoryController } from "./category.type.js";
import { TOKENS } from "../../config/tokens.js";
import { createCrudRoutes } from "../../shared/baseRouter.js";
import { authWithBusinessHandler } from "../../middlewares/authWithBusinessHandler.js";
import { authHandler } from "../../middlewares/authHandler.js";

const categoryRoute = (container: DependencyContainer) => {
  const categoryController = container.resolve<ICategoryController>(
    TOKENS.CATEGORY_CONTROLLER,
  );

  return createCrudRoutes(categoryController, {
    exclude: [],
    middleware: [
      authHandler,
      authWithBusinessHandler,
      hasPermission("manage_category"),
    ],
    overrideRoute: {
      list: [
        authHandler,
        authWithBusinessHandler,
        hasPermission("view_category"),
      ],
    },
    additionalRoute: [
      {
        name: "getCategoriesOfBusiness",
        method: "get",
        path: "/of/business",
        handler: categoryController.getCategoriesOfBusiness,
      },
    ],
  });
};

export default categoryRoute(container);
