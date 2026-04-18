import { Request, Response, NextFunction } from 'express'
import { ICrudService } from '../../shared/crudServiceInterface'
import { ICategory } from './category.model'
import {
    CategoryRequest,
    CreateCategorySchema,
} from './validations/createCategoryValidation'
import { UpdateCategorySchema } from './validations/updateCategoryValidation'
import { ApiResponse } from '../../types/apiResponseType'

export class CategoryController {
    private readonly categoryService: ICrudService<ICategory>

    constructor(categoryService: ICrudService<ICategory>) {
        this.categoryService = categoryService
    }

    //the reason of using arrow function inside class is to remove binding the function in route.
    getAllCatgories = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const categories = await this.categoryService.getAll()
            return res.status(200).json({ data: categories })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    getCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string }
            const category = await this.categoryService.getById(id)
            return res.status(200).json({ data: category })
        } catch (error) {
            next(error)
        }
    }

    createCategory = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const data: CategoryRequest = CreateCategorySchema.parse(req.body)
            const newCategory = await this.categoryService.create(data)
            const response: ApiResponse<typeof newCategory> = {
                success: true,
                data: newCategory,
                message: 'Category added successfully',
            }
            res.status(200).json(response)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    updateCategory = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { id } = req.params as { id: string }
            const data = UpdateCategorySchema.parse(req.body)
            const editCatgory = await this.categoryService.update(id, data)
            if (!editCatgory) {
                throw new Error('Category is not updated')
            }
            const response: ApiResponse<typeof editCatgory> = {
                success: true,
                data: editCatgory,
            }
            return res.status(200).json(response)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    deleteCategory = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { id } = req.params as { id: string }
            const deletedCategory = await this.categoryService.delete(id)
            if (!deletedCategory) {
                throw new Error('Category cannot deleted')
            }
            const response: ApiResponse<object> = {
                success: true,
                data: {},
                message: 'Category Deleted successfully',
            }
            return res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }
}
