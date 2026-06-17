import { Request, Response, NextFunction } from "express";
import { ICategory } from "./category.model";
import {
  CategoryRequest,
  CreateCategorySchema,
} from "./validations/createCategoryValidation";
import { UpdateCategorySchema } from "./validations/updateCategoryValidation";
import { ApiResponse } from "../../types/apiResponseType";
import { ICategoryController, ICategoryService } from "./category.type";
import { inject, singleton } from "tsyringe";
import { TOKENS } from "../../config/tokens";
import { NotFoundError, UnauthorizedError } from "../../errors/httpErrors";

@singleton()
export class CategoryController implements ICategoryController {
  constructor(
    @inject(TOKENS.CATEGORY_SERVICE)
    private readonly categoryService: ICategoryService,
  ) {}

  //the reason of using arrow function inside class is to remove binding the function in route.
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.categoryService.getAll();
      res.status(200).json({ data: categories });
      return;
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const category = await this.categoryService.getById(id);
      res.status(200).json({ data: category });
      return;
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authenticated user not found");
      }

      const { businessId } = req.user;

      if (!businessId) {
        throw new NotFoundError("Business Id not found to create the category");
      }

      const data: CategoryRequest = CreateCategorySchema.parse(req.body);

      const categoryDTO = {
        ...data,
        position: Number(data.position),
        businessId,
      };
      const newCategory = await this.categoryService.create(categoryDTO);
      const response: ApiResponse<typeof newCategory> = {
        success: true,
        data: newCategory,
        message: "Category added successfully",
      };
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authenticated user not found");
      }

      const { businessId } = req.user;

      if (!businessId) {
        throw new NotFoundError("Business Id not found to create the category");
      }

      const { id } = req.params as { id: string };
      const data = UpdateCategorySchema.parse(req.body);
      const editCatgory = await this.categoryService.update(id, data);
      if (!editCatgory) {
        throw new Error("Category is not updated");
      }
      const response: ApiResponse<typeof editCatgory> = {
        success: true,
        data: editCatgory,
      };
      res.status(200).json(response);
      return;
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const deletedCategory = await this.categoryService.delete(id);
      if (!deletedCategory) {
        throw new NotFoundError("Category is not exist");
      }
      const response: ApiResponse<object> = {
        success: true,
        data: {},
        message: "Category successfully deleted",
      };
      res.status(200).json(response);
      return;
    } catch (error) {
      next(error);
    }
  };

  getCategoriesOfBusiness = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("User is not authorized");
      }

      const { businessId } = req.user;
      const showAll: boolean = req.query.all === "true";

      if (!businessId) {
        throw new NotFoundError(
          "Business id not found to display its categories",
        );
      }

      console.log("business id", businessId);

      const categories = await this.categoryService.getCategoryByBusinessId(
        businessId,
        showAll,
      );

      const response: ApiResponse<ICategory[]> = {
        success: true,
        data: categories,
      };
      res.status(200).json(response);
    } catch (error: any) {
      next(error);
    }
  };

  getCategoryAndProductsByBusiness = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.terminal) {
        throw new UnauthorizedError("User is not authorized");
      }

      const { businessId } = req.terminal;

      if (!businessId) {
        throw new NotFoundError("Business not found");
      }

      const categoryWithProduct =
        await this.categoryService.getCategoryWithProduct(businessId);

      const response: ApiResponse<ICategory[]> = {
        success: true,
        data: categoryWithProduct,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
