import { singleton } from "tsyringe";
import { CrudRepository } from "../../shared/crudRepository";
import {
  CategoryModel,
  CreateCategoryDTO,
  ICategoryDocument,
  UpdateCategoryDTO,
} from "./category.model";
import { ICategoryRepository } from "./category.type";

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

  async getCategoryByBusinessId(
    businessId: string,
  ): Promise<ICategoryDocument[]> {
    return this.model.find({ businessId, deletedAt: null });
  }
}

// export const categoryRepository = new CategoryRepository();
