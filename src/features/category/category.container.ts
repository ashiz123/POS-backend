import { container } from "tsyringe";
import { TOKENS } from "../../config/tokens";
import { CategoryRepository } from "./category.repository";
import {
  ICategoryController,
  ICategoryRepository,
  ICategoryService,
} from "./category.type";
import { CategoryService } from "./category.service";
// import { ICategory } from "./category.model";
import { CategoryController } from "./category.controller";

container.registerSingleton<ICategoryRepository>(
  TOKENS.CATEGORY_REPOSITORY,
  CategoryRepository,
);

container.registerSingleton<ICategoryService>(
  TOKENS.CATEGORY_SERVICE,
  CategoryService,
);

container.registerSingleton<ICategoryController>(
  TOKENS.CATEGORY_CONTROLLER,
  CategoryController,
);
