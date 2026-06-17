import { Request, Response, NextFunction } from "express";

import {
  CreateProductSchema,
  ProductRequest,
  ProductUpdate,
  UpdateProductSchema,
} from "./validations/createProduct.validation";
import { ApiResponse } from "../../types/apiResponseType";
import { IProduct } from "./product.model";
import { AuthRequestWithBusiness } from "../../shared/requestType";
import { NotFoundError, UnauthorizedError } from "../../errors/httpErrors";
import { IProductController, IProductService } from "./product.type";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../config/tokens";

@injectable()
export class ProductController implements IProductController {
  constructor(
    @inject(TOKENS.PRODUCT_SERVICE)
    private productService: IProductService,
  ) {}

  list = async (
    req: AuthRequestWithBusiness,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authorised user not found");
      }

      const { businessId } = req.user;
      if (!businessId) {
        throw new UnauthorizedError("Unauthorized business");
      }
      const productsData =
        await this.productService.getProductsByBusinessId(businessId);

      const response: ApiResponse<IProduct[]> = {
        success: true,
        data: productsData,
      };
      res.status(200).json(response);
      return;
    } catch (err) {
      next(err);
    }
  };

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const product = await this.productService.getById(id);
      const response: ApiResponse<IProduct | null> = {
        success: true,
        data: product,
      };
      res.status(200).json(response);
      return;
    } catch (err) {
      next(err);
    }
  };

  create = async (
    req: AuthRequestWithBusiness,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Logged in user not found");
      }
      const data: ProductRequest = CreateProductSchema.parse(req.body);
      const { businessId } = req.user;

      if (!businessId) {
        throw new NotFoundError("Business not found to create product");
      }

      const newProductData = { ...data, businessId };
      const newProduct = await this.productService.create(newProductData);
      const response: ApiResponse<IProduct> = {
        success: true,
        data: newProduct,
        message: "Product created successfully",
      };

      res.status(201).json(response);
      return;
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params as { id: string };

      const validatedData: ProductUpdate = UpdateProductSchema.parse(req.body);
      const updatedProduct = await this.productService.update(
        id,
        validatedData,
      );
      const response: ApiResponse<IProduct | null> = {
        success: true,
        data: updatedProduct,
        message: "Product updated successfully",
      };

      res.status(200).json(response);
      return;
    } catch (err) {
      next(err);
    }
  };

  remove = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const deletedBusiness = await this.productService.delete(id);
      if (!deletedBusiness) {
        throw new NotFoundError("Product is not exist");
      }
      const response: ApiResponse<string> = {
        success: true,
        data: "product deleted",
        message: "Product deleted successfully",
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  filterByCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const productByCategory =
        await this.productService.getProductsByCategory(id);
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
