import { RouteHandler } from "../../shared/baseType";
import { ICrudController } from "../../shared/crudControllerInterface";
import { ICrudRepository } from "../../shared/crudRepository";
import { ICrudService } from "../../shared/crudServiceInterface";
import {
  CreateCategoryDTO,
  ICategory,
  ICategoryDocument,
  UpdateCategoryDTO,
} from "./category.model";

export interface ICategoryRepository extends ICrudRepository<
  ICategoryDocument,
  CreateCategoryDTO,
  UpdateCategoryDTO
> {
  getChildren(id: string): Promise<ICategoryDocument[]>;
  getActiveCategoriesOfBusiness(
    businessId: string,
  ): Promise<ICategoryDocument[]>;
  getAllCategoriesOfBusiness(businessId: string): Promise<ICategoryDocument[]>;
  getCategoryAndProductByBusiness(
    businessId: string,
  ): Promise<ICategoryDocument[]>;
}

export interface ICategoryService extends ICrudService<ICategory> {
  getCategoryByBusinessId(
    businessId: string,
    showAll?: boolean,
  ): Promise<ICategory[]>;
  getCategoryWithProduct(businessId: string): Promise<ICategory[]>;
}

export interface ICategoryController extends ICrudController {
  getCategoriesOfBusiness: RouteHandler;
  getCategoryAndProductsByBusiness: RouteHandler;
}

// export interface ICategoryController{
//   getAllCatgories: RouteHandler,
//   getCategory: RouteHandler,
//   createCategory: RouteHandler,

// }
