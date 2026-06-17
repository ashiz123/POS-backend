import { inject, injectable } from "tsyringe";

import {
  CreateProductDTO,
  IProduct,
  IProductDocument,
  UpdateProductDTO,
} from "./product.model";
import { productRepository } from "./product.repository";
import { IProductRepository, IProductService } from "./product.type";
import { TOKENS } from "../../config/tokens";
import { ExtraValidationError } from "../../errors/httpErrors";

@injectable()
export class ProductService implements IProductService {
  constructor(
    @inject(TOKENS.PRODUCT_REPOSITORY) private repo: IProductRepository,
  ) {}

  getById = async (productId: string): Promise<IProductDocument | null> => {
    return this.repo.findById(productId);
  };

  getAll = async (): Promise<IProductDocument[]> => {
    return this.repo.findAll();
  };

  getProductsByBusinessId = async (businessId: string): Promise<IProduct[]> => {
    const products = await this.repo.getProductByBusinessId(businessId);
    return products;
  };

  create = async (data: CreateProductDTO): Promise<IProductDocument> => {
    const sku = this.repo.generateSKU();
    return this.repo.create({ ...data, sku });
  };

  update = async (
    id: string,
    data: UpdateProductDTO,
  ): Promise<IProductDocument | null> => {
    const updateProduct = await this.repo.update(id, data);

    if (!updateProduct) {
      throw new ExtraValidationError("Data is not updated");
    }
    return updateProduct;
  };

  delete = async (id: string): Promise<boolean> => {
    return this.repo.delete(id);
  };

  getProductsByCategory = async (
    categoryId: string,
  ): Promise<IProduct[] | null> => {
    console.log("categoryId in service", categoryId);
    return this.repo.filterProductByCategoryId(categoryId);
  };

  getProductByDateRange = async (
    fromDate: Date,
    toDate: Date,
  ): Promise<IProduct[] | null> => {
    return this.repo.filterProductByDateRange(fromDate, toDate);
  };
}

export const productService = new ProductService(productRepository);
