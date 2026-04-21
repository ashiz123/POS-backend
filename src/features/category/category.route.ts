import { hasPermission } from "../../middlewares/hasPermission.js";
import { container, DependencyContainer } from "tsyringe";
import { ICategoryController } from "./category.type.js";
import { TOKENS } from "../../config/tokens.js";
import { createCrudRoutes } from "../../shared/baseRouter.js";
import { authWithBusinessHandler } from "../../middlewares/authWithBusinessHandler.js";

const categoryRoute = (container: DependencyContainer) => {
  const categoryController = container.resolve<ICategoryController>(
    TOKENS.CATEGORY_CONTROLLER,
  );

  return createCrudRoutes(categoryController, {
    exclude: [],
    middleware: [authWithBusinessHandler, hasPermission("manage_category")],
    additionalRoute: [
      {
        name: "getCategoriesByBusiness",
        method: "get",
        path: "/of/business",
        handler: categoryController.getCategoriesByBusiness,
      },
    ],
  });
};

export default categoryRoute(container);

//if in case code above does not work

// router.get(
//   "/",
//   authHandler,
//   hasPermission("handle_product"),
//   categoryController.getAllCatgories,
// );
// router.post(
//   "/create",
//   authHandler,
//   userAuthorityBusiness,
//   hasPermission("handle_product"),
//   categoryController.createCategory,
// );
// router.put("/update/:id", categoryController.updateCategory);
// router.delete("/delete/:id", categoryController.deleteCategory
