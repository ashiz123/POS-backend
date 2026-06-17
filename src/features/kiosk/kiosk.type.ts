import { RouteHandler } from "../../shared/baseType";

export interface IMenuController {
  getAllActiveCategories: RouteHandler;
  getProductsByCategory: RouteHandler;
}
