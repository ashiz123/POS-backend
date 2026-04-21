import { ExtraValidationError, NotFoundError } from "../../errors/httpErrors";
import { CreateCategoryDTO, ICategory } from "./category.model";
import { Types, UpdateQuery } from "mongoose";
import { CategoryRequest } from "./validations/createCategoryValidation";
import { inject, singleton } from "tsyringe";
import { ICategoryRepository, ICategoryService } from "./category.type";
import { TOKENS } from "../../config/tokens";

@singleton()
export class CategoryService implements ICategoryService {
  constructor(
    @inject(TOKENS.CATEGORY_REPOSITORY) private repo: ICategoryRepository,
  ) {}

  async getAll(): Promise<ICategory[]> {
    const categories = await this.repo.findAll();
    if (!categories.length) throw new NotFoundError("No categories found");
    return categories;
  }

  async getById(id: string): Promise<ICategory | null> {
    if (!id) {
      throw new Error("Category id required");
    }
    return this.repo.findById(id);
  }

  async create(data: Partial<ICategory>): Promise<ICategory> {
    console.log("service businessId", data.businessId);
    const persistenceData: CreateCategoryDTO = {
      ...(data as CategoryRequest),
      businessId: new Types.ObjectId(data.businessId),
      parentCategoryId: data.parentCategoryId
        ? new Types.ObjectId(data.parentCategoryId)
        : undefined,
    };
    const newCategory = await this.repo.create(persistenceData);
    return newCategory;
  }

  async update(
    id: string,
    data: UpdateQuery<ICategory>,
  ): Promise<ICategory | null> {
    const updatedCategory = await this.repo.update(id, data);

    if (!updatedCategory) {
      throw new ExtraValidationError("Data is not updated");
    }
    return updatedCategory;
  }

  async delete(id: string): Promise<boolean> {
    //check first the business have that categories list
    return this.repo.delete(id);
  }

  async getCategoryByBusinessId(businessId: string): Promise<ICategory[]> {
    const categories = await this.repo.getCategoryByBusinessId(businessId);
    if (!categories || categories.length === 0) {
      throw new NotFoundError("No categories found for this business");
    }

    return categories;
  }
}
