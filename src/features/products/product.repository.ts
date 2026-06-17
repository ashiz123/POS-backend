import { injectable } from "tsyringe";
import { CrudRepository } from "../../shared/crudRepository";
import {
  CreateProductDTO,
  IProduct,
  IProductDocument,
  ProductModel,
  UpdateProductDTO,
} from "./product.model";
import { IProductRepository } from "./product.type";
import { Types } from "mongoose";

@injectable()
export class ProductRepository
  extends CrudRepository<IProductDocument, CreateProductDTO, UpdateProductDTO>
  implements IProductRepository
{
  constructor() {
    super(ProductModel);
  }

  async filterProductByCategoryId(categoryId: string): Promise<IProduct[]> {
    const matchProduct = {
      $match: {
        categoryId: new Types.ObjectId(categoryId),
      },
    };

    const lookupFromInventoryBatches = {
      $lookup: {
        from: "inventorybatches",
        localField: "_id",
        foreignField: "productId",
        pipeline: [{ $match: { deletedAt: null } }],
        as: "batches",
      },
    };

    const addFieldTotalQuantity = {
      $addFields: {
        totalStock: { $sum: "$batches.quantity" },
      },
    };

    const matchConditionWithStock = {
      $match: {
        totalStock: { $gt: 0 },
      },
    };

    const project = {
      $project: {
        batches: 0,
      },
    };

    return await this.model.aggregate([
      matchProduct,
      lookupFromInventoryBatches,
      addFieldTotalQuantity,
      matchConditionWithStock,
      project,
    ]);
  }

  async filterProductByDateRange(
    fromDate: Date,
    toDate: Date,
  ): Promise<IProduct[]> {
    return this.model
      .find({
        createdAt: {
          $gte: fromDate,
          $lte: toDate,
        },
      })
      .lean()
      .sort({ createdAt: -1 })
      .exec();
  }

  async getProductByBusinessId(businessId: string): Promise<IProduct[]> {
    console.log("it comes here. let see");
    return this.model
      .find({ businessId: businessId })
      .populate("categoryId")
      .lean()
      .sort({ createdAt: -1 })
      .exec();
  }

  generateSKU(prefix: string = "SKU"): string {
    const timestamp = Date.now().toString(36); // shorter
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}

export const productRepository = new ProductRepository();
