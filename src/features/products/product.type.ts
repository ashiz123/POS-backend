import { RouteHandler } from "../../shared/baseType";
import { ICrudController } from "../../shared/crudControllerInterface";
import { ICrudRepository } from "../../shared/crudRepository";
import { ICrudService } from "../../shared/crudServiceInterface";
import {
  CreateProductDTO,
  IProduct,
  IProductDocument,
  UpdateProductDTO,
} from "./product.model";

export interface IProductService extends ICrudService<IProduct> {
  getProductsByCategory(categoryId: string): Promise<IProduct[] | null>;
  getProductByDateRange(
    fromDate: Date,
    toDate: Date,
  ): Promise<IProduct[] | null>;
  getProductsByBusinessId(businessId: string): Promise<IProduct[]>;
}

export interface IProductRepository extends ICrudRepository<
  IProductDocument,
  CreateProductDTO,
  UpdateProductDTO
> {
  filterProductByCategoryId(categoryId: string): Promise<IProduct[]>;
  filterProductByDateRange(fromDate: Date, toDate: Date): Promise<IProduct[]>;
  generateSKU(prefix?: string): string;
  getProductByBusinessId(businessId: string): Promise<IProduct[]>;

  // discountedProduct(): Promise<IProduct[]>
  // mostLikedProduct(): Promise<IProduct | null>
  // mostViewedProduct(): Promise<IProduct | null>
  // mostRatingProduct(): Promise<IProduct | null>
}

export interface IProductController extends ICrudController {
  filterByCategory: RouteHandler;
  // getProductByDateRange(
  //     fromDate: Date,
  //     toDate: Date
  // ): Promise<IProduct[] | null>
  // getProductsByBusinessId(businessId: string): Promise<IProduct[]>
}
