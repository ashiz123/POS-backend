import { NextFunction, Request, Response } from "express";
import { IMenuController } from "./kiosk.type";
import { NotFoundError, UnauthorizedError } from "../../errors/httpErrors";
import { ApiResponse } from "../../types/apiResponseType";
import { ICategory } from "../category/category.model";
import { inject, singleton } from "tsyringe";
import { ICategoryService } from "../category/category.type";
import { TOKENS } from "../../config/tokens";
import { IProductService } from "../products/product.type";
import { IProduct } from "../products/product.model";

@singleton()
export class MenuController implements IMenuController {
  constructor(
    @inject(TOKENS.CATEGORY_SERVICE)
    private readonly categoryService: ICategoryService,
    @inject(TOKENS.PRODUCT_SERVICE)
    private readonly productService: IProductService,
  ) {}

  public getAllActiveCategories = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.terminal) {
        throw new UnauthorizedError("Terminal not authorized");
      }

      if (!req.terminalUser) {
        throw new UnauthorizedError("User is not authorized");
      }

      const { businessId } = req.terminal;

      if (!businessId) {
        throw new NotFoundError("Business not found");
      }

      const categoryWithProduct =
        await this.categoryService.getCategoryByBusinessId(businessId);

      const response: ApiResponse<ICategory[]> = {
        success: true,
        data: categoryWithProduct,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getProductsByCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.terminal) {
        throw new UnauthorizedError("Terminal not authorized");
      }

      const { categoryId } = req.params as { categoryId: string };

      if (!categoryId || categoryId === "null" || categoryId === undefined) {
        throw new NotFoundError("Category id not found");
      }

      const productByCategory =
        await this.productService.getProductsByCategory(categoryId);
      const response: ApiResponse<IProduct[] | null> = {
        success: true,
        data: productByCategory,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };
}
