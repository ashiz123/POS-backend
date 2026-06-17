import { singleton } from "tsyringe";
import { CrudRepository } from "../../shared/crudRepository";
import {
  CategoryModel,
  CreateCategoryDTO,
  ICategoryDocument,
  UpdateCategoryDTO,
} from "./category.model";
import { ICategoryRepository } from "./category.type";
import { Types } from "mongoose";

@singleton()
export class CategoryRepository
  extends CrudRepository<
    ICategoryDocument,
    CreateCategoryDTO,
    UpdateCategoryDTO
  >
  implements ICategoryRepository
{
  constructor() {
    super(CategoryModel); // Pass the model to parent
  }

  async getChildren(id: string): Promise<ICategoryDocument[]> {
    return this.model.find({ parentCategoryId: id });
  }

  async getActiveCategoriesOfBusiness(
    businessId: string,
  ): Promise<ICategoryDocument[]> {
    return this.model
      .find({ businessId, deletedAt: null, isActive: true })
      .populate("parentCategoryId", "title");
  }

  async getAllCategoriesOfBusiness(
    businessId: string,
  ): Promise<ICategoryDocument[]> {
    return this.model
      .find({ businessId, deletedAt: null })
      .populate("parentCategoryId", "title");
  }

  async getCategoryAndProductByBusiness(
    businessId: string,
  ): Promise<ICategoryDocument[]> {
    const matchCategory = {
      $match: {
        businessId: new Types.ObjectId(businessId),
        deletedAt: null,
      },
    };

    const sortCategory = {
      $sort: { position: 1 },
    } as const;

    const lookupProduct = {
      $lookup: {
        from: "products",
        let: { catId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$categoryId", "$$catId"] },
            },
          },
          //to check that product have stock or not
          {
            $lookup: {
              from: "inventorybatches",
              localField: "_id",
              foreignField: "productId",
              as: "inventories",
            },
          },

          {
            $addFields: {
              totalStock: { $sum: "$inventories.quantity" },
            },
          },

          {
            $match: {
              totalStock: { $gt: 0 },
            },
          },

          { $limit: 4 },
        ],

        as: "products",
      },
    };

    const pipeline = [matchCategory, sortCategory, lookupProduct];

    return await this.model.aggregate<ICategoryDocument>(pipeline);
  }
}
